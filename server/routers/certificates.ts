import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../db";
import { publicProcedure, router } from "../trpc";

export const certificatesRouter = router({
  /** Active (non-revoked) certificates for public display. */
  list: publicProcedure.query(async () => {
    const rows = await db
      .select({
        certificateId: schema.certificates.id,
        verificationHash: schema.certificates.verificationHash,
        issuedAt: schema.certificates.issuedAt,
        revokedAt: schema.certificates.revokedAt,
        runId: schema.evaluationRuns.id,
        modelName: schema.models.name,
        developer: schema.models.developer,
        versionLabel: schema.benchmarkVersions.label,
      })
      .from(schema.certificates)
      .innerJoin(
        schema.evaluationRuns,
        eq(schema.certificates.runId, schema.evaluationRuns.id),
      )
      .innerJoin(
        schema.models,
        eq(schema.evaluationRuns.modelId, schema.models.id),
      )
      .innerJoin(
        schema.benchmarkVersions,
        eq(schema.evaluationRuns.versionId, schema.benchmarkVersions.id),
      )
      .orderBy(desc(schema.certificates.issuedAt));
    return rows.filter((r) => r.revokedAt === null);
  }),

  /**
   * Public verification: given a hash, confirm whether the platform
   * attests to it, and for which model/run. Revoked certificates are
   * reported as revoked, not hidden - retraction is public history.
   */
  verify: publicProcedure
    .input(z.object({ hash: z.string().regex(/^[a-f0-9]{64}$/i) }))
    .query(async ({ input }) => {
      const rows = await db
        .select({
          verificationHash: schema.certificates.verificationHash,
          issuedAt: schema.certificates.issuedAt,
          revokedAt: schema.certificates.revokedAt,
          runId: schema.evaluationRuns.id,
          modelName: schema.models.name,
          developer: schema.models.developer,
          versionLabel: schema.benchmarkVersions.label,
        })
        .from(schema.certificates)
        .innerJoin(
          schema.evaluationRuns,
          eq(schema.certificates.runId, schema.evaluationRuns.id),
        )
        .innerJoin(
          schema.models,
          eq(schema.evaluationRuns.modelId, schema.models.id),
        )
        .innerJoin(
          schema.benchmarkVersions,
          eq(schema.evaluationRuns.versionId, schema.benchmarkVersions.id),
        )
        .where(
          eq(schema.certificates.verificationHash, input.hash.toLowerCase()),
        )
        .limit(1);
      const cert = rows[0];
      if (!cert) return { status: "not_found" as const };
      if (cert.revokedAt !== null) {
        return {
          status: "revoked" as const,
          model: cert.modelName,
          developer: cert.developer,
          versionLabel: cert.versionLabel,
          issuedAt: cert.issuedAt,
          revokedAt: cert.revokedAt,
        };
      }
      return {
        status: "valid" as const,
        model: cert.modelName,
        developer: cert.developer,
        versionLabel: cert.versionLabel,
        issuedAt: cert.issuedAt,
      };
    }),
});

