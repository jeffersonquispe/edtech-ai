import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface RequestBody {
  text: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Generar embedding para query de búsqueda usando gte-small
async function generateQueryEmbedding(text: string): Promise<number[]> {
  try {
    const model = new Supabase.ai.Session("gte-small");
    const embedding = await model.run(text, {
      mean_pool: true,
      normalize: true,
    });

    if (!embedding || embedding.length === 0) {
      throw new Error("Empty embedding returned from model");
    }

    return embedding;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate embedding: ${errorMsg}`);
  }
}

async function handleRequest(req: Request): Promise<Response> {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: "Missing or invalid text field",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generar embedding del query
    const embedding = await generateQueryEmbedding(text.trim());

    return new Response(
      JSON.stringify({
        success: true,
        embedding,
        dimension: embedding.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error in generate-query-embedding:", errorMsg);

    return new Response(
      JSON.stringify({
        error: "Failed to generate embedding",
        message: errorMsg,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
}

Deno.serve(handleRequest);
