import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../db";
import { publicProcedure, router } from "../trpc";

export const leaderboardRouter = router({
  /**
   * Published runs only, private-test scores only. Returns per-model
   * per-axis scores plus the unweighted macro average across axes -
   * the headline Mizan score. If no run is published yet, the client
   * renders the honest empty state, never placeholder numbers.
   */
  table: publicProcedure
    .input(z.object({ versionLabel: z.string() }))
    .query(async ({ input }) => {
      const version = await db
        .select({ id: schema.benchmarkVersions.id })
        .from(schema.benchmarkVersions)
        .where(eq(schema.benchmarkVersions.label, input.versionLabel))
        .limit(1);
      const v = version[0];
      if (!v) return { entries: [] };

      const runs = await db
        .select({
          runId: schema.evaluationRuns.id,
          completedAt: schema.evaluationRuns.completedAt,
          modelId: schema.models.id,
          modelName: schema.models.name,
          developer: schema.models.developer,
          parameters: schema.models.parameters,
        })
        .from(schema.evaluationRuns)
        .innerJoin(
          schema.models,
          eq(schema.evaluationRuns.modelId, schema.models.id),
        )
        .where(eq(schema.evaluationRuns.versionId, v.id))
        .orderBy(desc(schema.evaluationRuns.completedAt));

      const published = await db
        .select({ id: schema.evaluationRuns.id })
        .from(schema.evaluationRuns)
        .where(eq(schema.evaluationRuns.status, "published"));
      const publishedIds = new Set(published.map((r) => r.id));

      // Latest published run per model.
      const latestByModel = new Map<number, (typeof runs)[number]>();
      for (const run of runs) {
        if (!publishedIds.has(run.runId)) continue;
        if (!latestByModel.has(run.modelId)) latestByModel.set(run.modelId, run);
      }
      const selectedRuns = [...latestByModel.values()];
      if (selectedRuns.length === 0) return { entries: [] };

      const results = await db
        .select()
        .from(schema.axisResults)
        .where(
          inArray(
            schema.axisResults.runId,
            selectedRuns.map((r) => r.runId),
          ),
        );

      const entries = selectedRuns.map((run) => {
        const runResults = results.filter((r) => r.runId === run.runId);
        // Prefer private-test scores; fall back to the public dev tier so the
        // pilot phase can show real (clearly labeled) numbers before the
        // private set exists.
        const hasPrivate = runResults.some((r) => r.tier === "private_test");
        const tier = hasPrivate ? "private_test" : "public_dev";
        const axisScores = runResults
          .filter((r) => r.tier === tier)
          .map((r) => ({
            track: r.track,
            axis: r.axis,
            score: r.score,
            ciLow: r.ciLow,
            ciHigh: r.ciHigh,
            nItems: r.nItems,
          }));
        const mean = (xs: number[]): number | null =>
          xs.length > 0 ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
        const arabicAverage = mean(
          axisScores.filter((r) => r.track === "arabic").map((r) => r.score),
        );
        const iraqiAverage = mean(
          axisScores.filter((r) => r.track === "iraqi").map((r) => r.score),
        );
        const macroAverage = mean(axisScores.map((r) => r.score));
        return {
          model: run.modelName,
          developer: run.developer,
          parameters: run.parameters,
          completedAt: run.completedAt,
          scoredTier: tier,
          axisScores,
          arabicAverage,
          iraqiAverage,
          macroAverage,
        };
      });

      entries.sort(
        (a, b) => (b.macroAverage ?? -1) - (a.macroAverage ?? -1),
      );
      return { entries };
    }),
});

