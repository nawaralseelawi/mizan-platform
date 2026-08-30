import { count, desc, eq } from "drizzle-orm";
import { db, schema } from "../db";
import { publicProcedure, router } from "../trpc";

export const modelsRouter = router({
  /** Registered models with their run counts. Public read. */
  list: publicProcedure.query(async () => {
    const models = await db
      .select()
      .from(schema.models)
      .orderBy(desc(schema.models.createdAt));

    const runCounts = await db
      .select({ modelId: schema.evaluationRuns.modelId, n: count() })
      .from(schema.evaluationRuns)
      .groupBy(schema.evaluationRuns.modelId);
    const runsByModel = new Map(runCounts.map((r) => [r.modelId, r.n]));

    const publishedCounts = await db
      .select({ modelId: schema.evaluationRuns.modelId, n: count() })
      .from(schema.evaluationRuns)
      .where(eq(schema.evaluationRuns.status, "published"))
      .groupBy(schema.evaluationRuns.modelId);
    const publishedByModel = new Map(publishedCounts.map((r) => [r.modelId, r.n]));

    return models.map((m) => ({
      id: m.id,
      name: m.name,
      developer: m.developer,
      parameters: m.parameters,
      license: m.license,
      source: m.source,
      totalRuns: runsByModel.get(m.id) ?? 0,
      publishedRuns: publishedByModel.get(m.id) ?? 0,
    }));
  }),

  /** Aggregate platform statistics. Real counts only - zero is shown as zero. */
  stats: publicProcedure.query(async () => {
    const [modelRows, publicItems, privateItems, publishedRuns] =
      await Promise.all([
        db.select({ n: count() }).from(schema.models),
        db.select({ n: count() }).from(schema.items),
        db.select({ n: count() }).from(schema.privateItemManifest),
        db
          .select({ n: count() })
          .from(schema.evaluationRuns)
          .where(eq(schema.evaluationRuns.status, "published")),
      ]);
    return {
      models: modelRows[0]?.n ?? 0,
      publicItems: publicItems[0]?.n ?? 0,
      privateItems: privateItems[0]?.n ?? 0,
      publishedRuns: publishedRuns[0]?.n ?? 0,
    };
  }),
});

