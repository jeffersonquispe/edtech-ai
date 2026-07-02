import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root of the Next.js project (one level up from edtech/)
const PROJECT_ROOT = path.resolve(__dirname, "../../");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const APP_DIR = path.join(PROJECT_ROOT, "src", "app");
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

// ── helpers ──────────────────────────────────────────────────────────────────

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Resolve and validate a path stays inside baseDir. Returns null on traversal. */
function safeResolve(baseDir: string, userPath: string): string | null {
  const resolved = path.resolve(baseDir, userPath);
  if (!resolved.startsWith(baseDir + path.sep) && resolved !== baseDir) {
    return null;
  }
  return resolved;
}

/** Extract `metadata.title` or a h1/heading comment from a TSX/page file. */
function extractTitle(filePath: string): string | null {
  try {
    const src = fs.readFileSync(filePath, "utf-8");
    // export const metadata = { title: "..." }
    const metaMatch = src.match(/metadata\s*=\s*\{[^}]*title\s*:\s*["'`]([^"'`]+)["'`]/);
    if (metaMatch) return metaMatch[1];
    // export default function SomeName — derive from function name
    const fnMatch = src.match(/export\s+default\s+(?:async\s+)?function\s+(\w+)/);
    if (fnMatch) return fnMatch[1].replace(/([A-Z])/g, " $1").trim();
    return null;
  } catch {
    return null;
  }
}

/** Walk src/app and return route entries. Only first-level route segments. */
function buildSitemap(): Array<{ route: string; title: string | null; file: string }> {
  const entries: Array<{ route: string; title: string | null; file: string }> = [];

  function walk(dir: string, prefix: string) {
    let items: fs.Dirent[];
    try {
      items = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    const pageFile = items.find(
      (i) => i.isFile() && (i.name === "page.tsx" || i.name === "page.ts")
    );
    if (pageFile) {
      const fullPath = path.join(dir, pageFile.name);
      entries.push({
        route: prefix || "/",
        title: extractTitle(fullPath),
        file: path.relative(PROJECT_ROOT, fullPath).replace(/\\/g, "/"),
      });
    }

    for (const item of items) {
      if (item.isDirectory() && !item.name.startsWith("_") && item.name !== "api") {
        const segment = item.name.startsWith("[") ? item.name : item.name;
        walk(path.join(dir, item.name), `${prefix}/${segment}`);
      }
    }
  }

  walk(APP_DIR, "");
  return entries.sort((a, b) => a.route.localeCompare(b.route));
}

// ── server ────────────────────────────────────────────────────────────────────

const server = new Server(
  { name: "edtech-context", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_assets",
      description:
        "Lista los archivos de la carpeta public/ del frontend. Devuelve nombre, tipo MIME básico y tamaño. No incluye subdirectorios profundos recursivos.",
      inputSchema: {
        type: "object",
        properties: {
          subdir: {
            type: "string",
            description: "Subdirectorio dentro de public/ a listar (opcional, ej: 'images')",
          },
        },
        additionalProperties: false,
      },
    },
    {
      name: "read_asset",
      description:
        "Devuelve el contenido de un archivo de public/ dado su ruta relativa (ej: 'images/logo.png'). Rechaza path traversal. Archivos binarios se devuelven en base64.",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Ruta relativa dentro de public/ (ej: 'robots.txt')",
          },
        },
        required: ["path"],
        additionalProperties: false,
      },
    },
    {
      name: "get_sitemap",
      description:
        "Genera la lista de rutas de la app Next.js (src/app/) con su título de página si está disponible en metadata o el nombre de la función.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
    {
      name: "get_catalog_context",
      description:
        "Llama a GET /api/courses del backend y devuelve los cursos publicados (id, título, nivel, categoría, precio) como contexto estructurado. Falla con mensaje claro si el backend no responde.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // ── list_assets ────────────────────────────────────────────────────────────
  if (name === "list_assets") {
    const subdir = (args as Record<string, string>)?.subdir ?? "";
    const targetDir = subdir ? path.join(PUBLIC_DIR, subdir) : PUBLIC_DIR;

    // Validate subdir doesn't escape public/
    if (subdir) {
      const resolved = safeResolve(PUBLIC_DIR, subdir);
      if (!resolved) {
        return {
          content: [{ type: "text", text: "Error: ruta fuera de public/ no permitida." }],
          isError: true,
        };
      }
    }

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(targetDir, { withFileTypes: true });
    } catch {
      return {
        content: [{ type: "text", text: `Error: no se pudo leer ${targetDir}` }],
        isError: true,
      };
    }

    const files = entries
      .filter((e) => e.isFile())
      .map((e) => {
        const fullPath = path.join(targetDir, e.name);
        const stats = fs.statSync(fullPath);
        const ext = path.extname(e.name).toLowerCase();
        const typeMap: Record<string, string> = {
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".svg": "image/svg+xml",
          ".gif": "image/gif",
          ".webp": "image/webp",
          ".ico": "image/x-icon",
          ".txt": "text/plain",
          ".json": "application/json",
          ".xml": "application/xml",
          ".pdf": "application/pdf",
          ".mp4": "video/mp4",
          ".mp3": "audio/mpeg",
        };
        return {
          name: e.name,
          relativePath: subdir ? `${subdir}/${e.name}` : e.name,
          type: typeMap[ext] ?? "application/octet-stream",
          size: humanSize(stats.size),
          sizeBytes: stats.size,
        };
      });

    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              directory: subdir || "/",
              files,
              subdirectories: dirs,
              total: files.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // ── read_asset ─────────────────────────────────────────────────────────────
  if (name === "read_asset") {
    const userPath = (args as Record<string, string>)?.path;
    if (!userPath) {
      return {
        content: [{ type: "text", text: "Error: falta el parámetro 'path'." }],
        isError: true,
      };
    }

    const resolved = safeResolve(PUBLIC_DIR, userPath);
    if (!resolved) {
      return {
        content: [{ type: "text", text: "Error: path traversal detectado. Solo se permiten archivos dentro de public/." }],
        isError: true,
      };
    }

    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      return {
        content: [{ type: "text", text: `Error: archivo no encontrado: ${userPath}` }],
        isError: true,
      };
    }

    const ext = path.extname(resolved).toLowerCase();
    const textExts = new Set([".txt", ".json", ".xml", ".svg", ".html", ".css", ".js", ".ts", ".md", ".csv"]);

    if (textExts.has(ext)) {
      const content = fs.readFileSync(resolved, "utf-8");
      return {
        content: [{ type: "text", text: content }],
      };
    } else {
      // Binary — base64
      const buf = fs.readFileSync(resolved);
      const b64 = buf.toString("base64");
      const stats = fs.statSync(resolved);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              file: userPath,
              encoding: "base64",
              size: humanSize(stats.size),
              data: b64,
            }),
          },
        ],
      };
    }
  }

  // ── get_sitemap ────────────────────────────────────────────────────────────
  if (name === "get_sitemap") {
    const routes = buildSitemap();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ routes, total: routes.length }, null, 2),
        },
      ],
    };
  }

  // ── get_catalog_context ────────────────────────────────────────────────────
  if (name === "get_catalog_context") {
    const url = `${BACKEND_URL}/api/courses`;
    let raw: unknown;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) {
        return {
          content: [
            {
              type: "text",
              text: `Error: el backend respondió con HTTP ${res.status} en ${url}`,
            },
          ],
          isError: true,
        };
      }
      raw = await res.json();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [
          {
            type: "text",
            text: `Error: no se pudo conectar al backend en ${url}. Detalle: ${message}. Asegúrate de que el servidor Next.js esté corriendo.`,
          },
        ],
        isError: true,
      };
    }

    // Normalize — the API may return an array directly or { courses: [...] }
    const list: unknown[] = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as Record<string, unknown>)?.courses)
      ? ((raw as Record<string, unknown>).courses as unknown[])
      : [];

    const courses = list.map((c) => {
      const course = c as Record<string, unknown>;
      return {
        id: course.id,
        titulo: course.titulo ?? course.title,
        nivel: course.nivel ?? course.level,
        categoria: course.categoria ?? course.category,
        precio: course.precio ?? course.price,
        estado: course.estado ?? course.status,
      };
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ source: url, total: courses.length, courses }, null, 2),
        },
      ],
    };
  }

  return {
    content: [{ type: "text", text: `Error: herramienta desconocida: ${name}` }],
    isError: true,
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server error:", err);
  process.exit(1);
});
