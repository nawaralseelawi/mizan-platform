import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../db";
import {
  issueCertificateForRun,
  revokeCertificateForRun,
} from "../services/certificates";
import { adminProcedure, router } from "../trpc";

export const adminRouter = router({
  /** All evaluation runs with model/version context, newest first. */
  runs: adminProcedure.query(async () => {
    const rows = await db
      .select({
        runId: schema.evaluationRuns.id,
        status: schema.evaluationRuns.status,
        completedAt: schema.evaluationRuns.completedAt,
        importedAt: schema.evaluationRuns.importedAt,
        harnessCommit: schema.evaluationRuns.harnessCommit,
        modelName: schema.models.name,
        developer: schema.models.developer,
        versionLabel: schema.benchmarkVersions.label,
      })
      .from(schema.evaluationRuns)
      .innerJoin(
        schema.models,
        eq(schema.evaluationRuns.modelId, schema.models.id),
      )
      .innerJoin(
        schema.benchmarkVersions,
        eq(schema.evaluationRuns.versionId, schema.benchmarkVersions.id),
      )
      .orderBy(desc(schema.evaluationRuns.importedAt));

    const results = await db.select().from(schema.axisResults);
    return rows.map((run) => ({
      ...run,
      axes: results.filter((r) => r.runId === run.runId).length,
    }));
  }),

  /**
   * Publish a run: it becomes visible on the public leaderboard and a
   * certificate with a verification hash is issued. Explicit human action
   * by design - results never publish themselves.
   */
  publishRun: adminProcedure
    .input(z.object({ runId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const runRows = await db
        .select()
        .from(schema.evaluationRuns)
        .where(eq(schema.evaluationRuns.id, input.runId))
        .limit(1);
      const run = runRows[0];
      if (!run) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Run not found" });
      }
      if (run.status === "published") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Run is already published",
        });
      }

      const verificationHash = await issueCertificateForRun(input.runId);
      await db
        .update(schema.evaluationRuns)
        .set({ status: "published" })
        .where(eq(schema.evaluationRuns.id, input.runId));
      return { runId: input.runId, verificationHash };
    }),

  /**
   * Retract a published run: it leaves the leaderboard and its certificate
   * is marked revoked (the record is kept - retraction is public history,
   * not deletion).
   */
  retractRun: adminProcedure
    .input(z.object({ runId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const runRows = await db
        .select()
        .from(schema.evaluationRuns)
        .where(eq(schema.evaluationRuns.id, input.runId))
        .limit(1);
      const run = runRows[0];
      if (!run) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Run not found" });
      }
      if (run.status !== "published") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Only published runs can be retracted",
        });
      }

      await revokeCertificateForRun(input.runId);
      await db
        .update(schema.evaluationRuns)
        .set({ status: "retracted" })
        .where(eq(schema.evaluationRuns.id, input.runId));
      return { runId: input.runId };
    }),

  /**
   * Permanently delete a run. Removes its certificate (if any) first, then
   * the run itself; axis_results are removed by ON DELETE CASCADE. Intended
   * for accidental/duplicate runs (e.g. re-runs after a power cut), not for
   * retracting legitimate published history - use retractRun for that.
   */
  deleteRun: adminProcedure
    .input(z.object({ runId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const runRows = await db
        .select()
        .from(schema.evaluationRuns)
        .where(eq(schema.evaluationRuns.id, input.runId))
        .limit(1);
      if (!runRows[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Run not found" });
      }
      // Remove the certificate row first (FK is not cascade).
      await db
        .delete(schema.certificates)
        .where(eq(schema.certificates.runId, input.runId));
      await db
        .delete(schema.evaluationRuns)
        .where(eq(schema.evaluationRuns.id, input.runId));
      return { runId: input.runId, deleted: true };
    }),

  /**
   * De-duplicate the board: for every model, KEEP only its newest run
   * (highest id), publish that one, and DELETE all older runs of the same
   * model. This cleans up the duplicates created by repeated batch re-runs.
   * Returns a per-model summary of what was kept and how many were removed.
   */
  cleanupDuplicates: adminProcedure.mutation(async () => {
    const runs = await db
      .select({
        id: schema.evaluationRuns.id,
        modelId: schema.evaluationRuns.modelId,
        status: schema.evaluationRuns.status,
        modelName: schema.models.name,
      })
      .from(schema.evaluationRuns)
      .innerJoin(
        schema.models,
        eq(schema.evaluationRuns.modelId, schema.models.id),
      )
      .orderBy(desc(schema.evaluationRuns.id));

    // Group by model; because runs are ordered id-desc, the first run seen
    // for each model is the newest = the keeper.
    const keeperByModel = new Map<number, number>();
    const toDelete: number[] = [];
    for (const r of runs) {
      if (!keeperByModel.has(r.modelId)) {
        keeperByModel.set(r.modelId, r.id);
      } else {
        toDelete.push(r.id);
      }
    }

    // Delete every non-keeper run (certificate first, then the run).
    for (const runId of toDelete) {
      await db
        .delete(schema.certificates)
        .where(eq(schema.certificates.runId, runId));
      await db
        .delete(schema.evaluationRuns)
        .where(eq(schema.evaluationRuns.id, runId));
    }

    // Ensure each surviving keeper is published (issue a certificate if it
    // is not already published).
    let published = 0;
    for (const keeperId of keeperByModel.values()) {
      const cur = await db
        .select({ status: schema.evaluationRuns.status })
        .from(schema.evaluationRuns)
        .where(eq(schema.evaluationRuns.id, keeperId))
        .limit(1);
      if (cur[0] && cur[0].status !== "published") {
        await issueCertificateForRun(keeperId);
        await db
          .update(schema.evaluationRuns)
          .set({ status: "published" })
          .where(eq(schema.evaluationRuns.id, keeperId));
        published++;
      }
    }

    return {
      modelsKept: keeperByModel.size,
      runsDeleted: toDelete.length,
      newlyPublished: published,
    };
  }),
});

