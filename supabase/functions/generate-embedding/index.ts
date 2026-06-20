import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface RequestBody {
  course_id: string;
  text: string;
  action: "insert" | "update";
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Generar embedding usando Supabase.ai con gte-small (gratuito)
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Usar Supabase.ai Session con el modelo gte-small
    const model = new Supabase.ai.Session("gte-small");
    const embedding = await model.run(text, {
      mean_pool: true,
      normalize: true,
    });

    // El embedding es un array de números
    if (!embedding || embedding.length === 0) {
      throw new Error("Empty embedding returned from model");
    }

    return embedding;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate embedding: ${errorMsg}`);
  }
}

// Guardar embedding en BD
async function saveEmbedding(
  client: ReturnType<typeof createClient>,
  courseId: string,
  embedding: number[]
): Promise<void> {
  const { error } = await client
    .from("courses")
    .update({ embedding })
    .eq("id", courseId);

  if (error) {
    throw new Error(`Failed to save embedding: ${error.message}`);
  }
}

// Actualizar estado del job de embedding
async function updateJobStatus(
  client: ReturnType<typeof createClient>,
  courseId: string,
  status: "processing" | "completed" | "failed",
  errorMessage?: string
): Promise<void> {
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "completed") {
    updateData.completed_at = new Date().toISOString();
  }

  if (errorMessage) {
    updateData.error_message = errorMessage;
    // Incrementar retry_count si es fallido
    if (status === "failed") {
      // Fetchear el job actual para incrementar retry_count
      const { data: job } = await client
        .from("embedding_jobs")
        .select("retry_count")
        .eq("course_id", courseId)
        .eq("status", "processing")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (job) {
        updateData.retry_count = job.retry_count + 1;
      }
    }
  }

  const { error } = await client
    .from("embedding_jobs")
    .update(updateData)
    .eq("course_id", courseId)
    .eq("status", "processing")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error(`Failed to update job status: ${error.message}`);
  }
}

async function handleEmbeddingRequest(req: Request): Promise<Response> {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing environment variables" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = (await req.json()) as RequestBody;
    const { course_id, text, action } = body;

    if (!course_id || !text) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: course_id, text",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = createClient(supabaseUrl, supabaseServiceKey);

    // Marcar como "processing"
    await updateJobStatus(client, course_id, "processing");

    let embedding: number[] | null = null;
    let lastError: Error | null = null;

    // Reintentos con backoff exponencial (3 intentos máximo)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        embedding = await generateEmbedding(text);
        console.log(
          `✓ Generated embedding for course ${course_id} (attempt ${attempt})`
        );
        break;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `⚠ Attempt ${attempt}/3 failed: ${lastError.message}`
        );

        // Esperar antes de reintentar (backoff exponencial: 1s, 2s, 4s)
        if (attempt < 3) {
          const delayMs = Math.pow(2, attempt - 1) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    if (!embedding) {
      // Registrar como fallido (se podrá reintentar después)
      await updateJobStatus(
        client,
        course_id,
        "failed",
        lastError?.message || "Unknown error"
      );

      return new Response(
        JSON.stringify({
          error: "Failed to generate embedding after 3 retries",
          details: lastError?.message,
          course_id,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Guardar embedding en BD
    await saveEmbedding(client, course_id, embedding);

    // Marcar como completado
    await updateJobStatus(client, course_id, "completed");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Embedding generated and saved successfully",
        course_id,
        embedding_dimension: embedding.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error in generate-embedding:", errorMsg);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: errorMsg,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
}

Deno.serve(handleEmbeddingRequest);
