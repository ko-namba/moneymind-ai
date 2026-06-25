import { jsonError, jsonOk } from "@/lib/api/response";
import { seedSampleExpenses } from "@/lib/seed/seed-expenses";
import { z } from "zod";

const seedRequestSchema = z.object({
  force: z.boolean().optional().default(false),
  withEmbeddings: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return jsonError("本番環境ではサンプルデータ投入は利用できません。", 403);
  }

  try {
    const body: unknown = await request.json().catch(() => ({}));
    const options = seedRequestSchema.parse(body);
    const result = await seedSampleExpenses(options);

    return jsonOk(result, result.inserted > 0 ? 201 : 200);
  } catch (error) {
    console.error("POST /api/seed", error);
    return jsonError(
      error instanceof Error ? error.message : "サンプルデータの投入に失敗しました。",
      500,
    );
  }
}
