import { and, count, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  AxisSchema,
  DialectRegionSchema,
  DifficultySchema,
  TrackSchema,
} from "@shared/types";
import { db, schema } from "../db";
import { publicProcedure, router } from "../trpc";

export const benchmarkRouter = router({
  versions: publicProcedure.query(() =>
    db
      .select()
      .from(schema.benchmarkVersions)
      .orderBy(schema.benchmarkVersions.createdAt),
  ),

  /**
   * Aggregate composition of a version: item counts by axis / region /
   * difficulty, split by tier. Private items contribute counts only -
   * their content is not in this database at all.
   */
  composition: publicProcedure
    .input(z.object({ versionLabel: z.string() }))
    .query(async ({ input }) => {
      const version = await db
        .select()
        .from(schema.benchmarkVersions)
        .where(eq(schema.benchmarkVersions.label, input.versionLabel))
        .limit(1);
      const v = version[0];
      if (!v) return null;

      const byAxisPublic = await db
        .select({
          track: schema.items.track,
          axis: schema.items.axis,
          n: count(),
        })
        .from(schema.items)
        .where(eq(schema.items.versionId, v.id))
        .groupBy(schema.items.track, schema.items.axis);

      const byAxisPrivate = await db
        .select({
          track: schema.privateItemManifest.track,
          axis: schema.privateItemManifest.axis,
          n: count(),
        })
        .from(schema.privateItemManifest)
        .where(eq(schema.privateItemManifest.versionId, v.id))
        .groupBy(
          schema.privateItemManifest.track,
          schema.privateItemManifest.axis,
        );

      const byRegionPublic = await db
        .select({ region: schema.items.dialectRegion, n: count() })
        .from(schema.items)
        .where(eq(schema.items.versionId, v.id))
        .groupBy(schema.items.dialectRegion);

      return {
        version: v,
        publicByAxis: byAxisPublic,
        privateByAxis: byAxisPrivate,
        publicByRegion: byRegionPublic,
      };
    }),

  /** Paginated browser over PUBLIC dev items only. */
  publicItems: publicProcedure
    .input(
      z.object({
        versionLabel: z.string(),
        track: TrackSchema.optional(),
        axis: AxisSchema.optional(),
        dialectRegion: DialectRegionSchema.optional(),
        difficulty: DifficultySchema.optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input }) => {
      const version = await db
        .select({ id: schema.benchmarkVersions.id })
        .from(schema.benchmarkVersions)
        .where(eq(schema.benchmarkVersions.label, input.versionLabel))
        .limit(1);
      const v = version[0];
      if (!v) return { total: 0, items: [] };

      const conditions = [eq(schema.items.versionId, v.id)];
      if (input.track) conditions.push(eq(schema.items.track, input.track));
      if (input.axis) conditions.push(eq(schema.items.axis, input.axis));
      if (input.dialectRegion)
        conditions.push(eq(schema.items.dialectRegion, input.dialectRegion));
      if (input.difficulty)
        conditions.push(eq(schema.items.difficulty, input.difficulty));
      const where = and(...conditions);

      const totalRows = await db
        .select({ n: count() })
        .from(schema.items)
        .where(where);
      const total = totalRows[0]?.n ?? 0;

      const rows = await db
        .select({
          itemId: schema.items.itemId,
          track: schema.items.track,
          axis: schema.items.axis,
          questionFormat: schema.items.questionFormat,
          difficulty: schema.items.difficulty,
          dialectRegion: schema.items.dialectRegion,
          prompt: schema.items.prompt,
          context: schema.items.context,
          payload: schema.items.payload,
        })
        .from(schema.items)
        .where(where)
        .orderBy(sql`${schema.items.itemId} ASC`)
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);

      return { total, items: rows };
    }),
});

