import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface EmbeddingJob {
  id: string;
  course_id: string;
  action: string;
  text_chunk: string;
  retry_count: number;
  max_retries: number;
}

// Generar embedding usando Supabase.ai (gte-small)
async function generateEmbedding(text: string): Promise<number[]> {
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

// Reintentar jobs de embedding fallidos
async function retryFailedEmbeddings() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const client = createClient(supabaseUrl, supabaseServiceKey);

  // Obtener jobs fallidos que pueden reintentar (retry_count < max_retries)
  const { data: failedJobs, error: fetchError } = await client
    .from("embedding_jobs")
    .select("*")
    .eq("status", "failed")
    .lt("retry_count", "max_retries")
    .order("updated_at", { ascending: true })
    .limit(20);

  if (fetchError) {
    throw new Error(`Failed to fetch jobs: ${fetchError.message}`);
  }

  if (!failedJobs || failedJobs.length === 0) {
    console.log("✓ No failed embedding jobs to retry");
    return {
      success: true,
      message: "No jobs to retry",
      count: 0,
    };
  }

  console.log(`🔄 Found ${failedJobs.length} failed jobs to retry`);

  let successCount = 0;
  let failureCount = 0;

  for (const job of failedJobs as EmbeddingJob[]) {
    try {
      // Marcar como processing
      await client
        .from("embedding_jobs")
        .update({ status: "processing" })
        .eq("id", job.id);

      // Intentar generar embedding con reintentos
      let embedding: number[] | null = null;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          embedding = await generateEmbedding(job.text_chunk);
          break;
        } catch (error) {
          lastError = error as Error;
          console.warn(
            `⚠ Retry attempt ${attempt}/2 failed: ${lastError.message}`
          );
          if (attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          }
        }
      }

      if (!embedding) {
        throw lastError || new Error("Failed to generate embedding");
      }

      // Guardar embedding en BD
      await client
        .from("courses")
        .update({ embedding })
        .eq("id", job.course_id);

      // Marcar como completado
      await client
        .from("embedding_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          error_message: null,
        })
        .eq("id", job.id);

      successCount++;
      console.log(`✓ Retried embedding for course ${job.course_id}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const newRetryCount = job.retry_count + 1;

      // Actualizar con reintento incrementado
      await client
        .from("embedding_jobs")
        .update({
          status: "failed",
          retry_count: newRetryCount,
          error_message: errorMsg,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      failureCount++;
      console.warn(
        `✗ Retry failed for course ${job.course_id} (attempt ${newRetryCount}/${job.max_retries}): ${errorMsg}`
      );
    }
  }

  return {
    success: true,
    message: `Retry completed: ${successCount} success, ${failureCount} still failing`,
    successCount,
    failureCount,
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const result = await retryFailedEmbeddings();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error in retry-embedding-jobs:", errorMsg);

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
});

