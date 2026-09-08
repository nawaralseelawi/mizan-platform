import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../db";
import { publicProcedure, router } from "../trpc";
import { wilsonFromScore, wilsonInterval } from "../lib/stats";

/**
 * Axes whose per-item outcomes are auto-scored and treated as binomial for
 * interval purposes. Comprehension and knowledge are exact Bernoulli
 * (multiple choice). Official-documents extraction scores are per-item
 * field-match fractions in [0, 1]; the binomial treatment is a documented
 * CONSERVATIVE approximation (Bernoulli variance is maximal for bounded
 * variables). Human-rubric axes are never given Wilson intervals here.
 */
const AUTO_AXES = new Set(["comprehension", "knowledge", "official_documents"]);

export const leaderboardRouter = router({
  /**
   * Published runs only. Returns per-model per-axis scores plus the
   * unweighted macro average across axes - the headline Mizan score.
   * If no run is published yet, the client renders the honest empty
   * state, never placeholder numbers.
   *
   * Confidence intervals: stored ciLow/ciHigh are used when present
   * (future bootstrap/import-time values take precedence). When absent,
   * a 95% Wilson interval is computed on the fly for auto-scored axes
   * from (score, nItems). Pooled per-track intervals over the auto axes
   * are also returned; with equal per-axis item counts the pooled
   * proportion equals the unweighted track mean over those axes.
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
          .map((r) => {
            let ciLow = r.ciLow;
            let ciHigh = r.ciHigh;
            if (
              (ciLow === null || ciHigh === null) &&
              AUTO_AXES.has(r.axis) &&
              r.nItems > 0
            ) {
              const ci = wilsonFromScore(r.score, r.nItems);
              if (ci) {
                ciLow = ci.low;
                ciHigh = ci.high;
              }
            }
            return {
              track: r.track,
              axis: r.axis,
              score: r.score,
              ciLow,
              ciHigh,
              nItems: r.nItems,
            };
          });

        const mean = (xs: number[]): number | null =>
          xs.length > 0 ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
        const arabicAverage = mean(
          axisScores.filter((r) => r.track === "arabic").map((r) => r.score),
        );
        const iraqiAverage = mean(
          axisScores.filter((r) => r.track === "iraqi").map((r) => r.score),
        );
        const macroAverage = mean(axisScores.map((r) => r.score));

        // Pooled Wilson interval per track over the auto-scored axes:
        // k = sum of reconstructed correct counts, n = sum of item counts.
        const pooledCi = (track: "arabic" | "iraqi") => {
          const rows = axisScores.filter(
            (r) => r.track === track && AUTO_AXES.has(r.axis) && r.nItems > 0,
          );
          if (rows.length === 0) return null;
          const n = rows.reduce((a, r) => a + r.nItems, 0);
          const k = rows.reduce((a, r) => a + Math.round(r.score * r.nItems), 0);
          return wilsonInterval(k, n);
        };
        const arabicAutoCi = pooledCi("arabic");
        const iraqiAutoCi = pooledCi("iraqi");

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
          arabicAutoCiLow: arabicAutoCi?.low ?? null,
          arabicAutoCiHigh: arabicAutoCi?.high ?? null,
          iraqiAutoCiLow: iraqiAutoCi?.low ?? null,
          iraqiAutoCiHigh: iraqiAutoCi?.high ?? null,
        };
      });

      // Ordering with a DECLARED tie-break rule. Scores are compared at
      // display precision (one decimal on the 0-100 scale) so the visible
      // ranking never contradicts the visible numbers. When the rounded
      // overall is tied, the higher Iraqi-track average leads - the Iraqi
      // track is Mizan's core measure by ratified design. Any remaining
      // tie falls back to the raw values and finally to the model name,
      // keeping the order fully deterministic across imports.
      const disp = (x: number | null): number =>
        x === null ? -1 : Math.round(x * 1000);
      entries.sort((a, b) => {
        const dMacro = disp(b.macroAverage) - disp(a.macroAverage);
        if (dMacro !== 0) return dMacro;
        const dIraqi = disp(b.iraqiAverage) - disp(a.iraqiAverage);
        if (dIraqi !== 0) return dIraqi;
        const dRaw = (b.macroAverage ?? -1) - (a.macroAverage ?? -1);
        if (Math.abs(dRaw) > 1e-12) return dRaw > 0 ? 1 : -1;
        return a.model.localeCompare(b.model);
      });
      return { entries };
    }),
});
