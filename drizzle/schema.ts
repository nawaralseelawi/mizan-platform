/**
 * Mizan platform database schema (PostgreSQL).
 *
 * Architectural invariant: content of private_test items is NEVER stored in
 * this database. Only their SHA-256 manifest lives here (private_item_manifest)
 * so that imported results can be verified against a known item set without
 * the platform ever holding the secret content. The encrypted vault holding
 * actual private items is managed offline, outside this system.
 */
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums (kept in lockstep with shared/types.ts)
// ---------------------------------------------------------------------------

export const trackEnum = pgEnum("track", ["arabic", "iraqi"]);

export const axisEnum = pgEnum("axis", [
  "comprehension",
  "generation",
  "translation",
  "knowledge",
  "official_documents",
  "safety",
]);

export const questionFormatEnum = pgEnum("question_format", [
  "multiple_choice",
  "open_generation",
  "extraction",
]);

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

export const dialectRegionEnum = pgEnum("dialect_region", [
  "baghdadi",
  "southern",
  "maslawi",
  "mixed",
  "msa",
]);

export const tierEnum = pgEnum("contamination_tier", [
  "public_dev",
  "private_test",
]);

export const userRoleEnum = pgEnum("user_role", [
  "viewer",
  "maintainer",
  "admin",
]);

export const runStatusEnum = pgEnum("run_status", [
  "imported",
  "verified",
  "published",
  "retracted",
]);

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  role: userRoleEnum("role").notNull().default("viewer"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastSignedIn: timestamp("last_signed_in"),
});
export type User = typeof users.$inferSelect;

// ---------------------------------------------------------------------------
// Benchmark structure
// ---------------------------------------------------------------------------

export const benchmarkVersions = pgTable("benchmark_versions", {
  id: serial("id").primaryKey(),
  /** Semantic label, e.g. "pilot-0.1", "v1.0". */
  label: varchar("label", { length: 32 }).notNull().unique(),
  description: text("description"),
  /** Frozen versions reject further item imports. */
  isFrozen: boolean("is_frozen").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type BenchmarkVersion = typeof benchmarkVersions.$inferSelect;

/** Public dev-set items only. Private items never reach this table. */
export const items = pgTable(
  "items",
  {
    id: serial("id").primaryKey(),
    versionId: integer("version_id")
      .notNull()
      .references(() => benchmarkVersions.id),
    itemId: varchar("item_id", { length: 64 }).notNull(),
    track: trackEnum("track").notNull(),
    axis: axisEnum("axis").notNull(),
    questionFormat: questionFormatEnum("question_format").notNull(),
    difficulty: difficultyEnum("difficulty").notNull(),
    dialectRegion: dialectRegionEnum("dialect_region").notNull(),
    prompt: text("prompt").notNull(),
    context: text("context"),
    /** Format-specific payload: choices/correct_answer, ground_truth, rubric_id. */
    payload: jsonb("payload").notNull(),
    /** SHA-256 of the canonical JSONL line, for provenance. */
    contentHash: varchar("content_hash", { length: 64 }).notNull(),
    importedAt: timestamp("imported_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("items_version_item_unique").on(t.versionId, t.itemId),
    index("items_axis_idx").on(t.axis),
    index("items_region_idx").on(t.dialectRegion),
  ],
);
export type Item = typeof items.$inferSelect;

/** Hash-only manifest of private test items. No content, ever. */
export const privateItemManifest = pgTable(
  "private_item_manifest",
  {
    id: serial("id").primaryKey(),
    versionId: integer("version_id")
      .notNull()
      .references(() => benchmarkVersions.id),
    itemId: varchar("item_id", { length: 64 }).notNull(),
    track: trackEnum("track").notNull(),
    axis: axisEnum("axis").notNull(),
    questionFormat: questionFormatEnum("question_format").notNull(),
    difficulty: difficultyEnum("difficulty").notNull(),
    dialectRegion: dialectRegionEnum("dialect_region").notNull(),
    contentHash: varchar("content_hash", { length: 64 }).notNull(),
    importedAt: timestamp("imported_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("manifest_version_item_unique").on(t.versionId, t.itemId),
  ],
);
export type PrivateItemManifestRow = typeof privateItemManifest.$inferSelect;

// ---------------------------------------------------------------------------
// Models and results
// ---------------------------------------------------------------------------

export const models = pgTable(
  "models",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    developer: varchar("developer", { length: 128 }).notNull(),
    parameters: varchar("parameters", { length: 32 }),
    license: varchar("license", { length: 128 }),
    source: text("source"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("models_name_dev_unique").on(t.name, t.developer)],
);
export type Model = typeof models.$inferSelect;

export const evaluationRuns = pgTable("evaluation_runs", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id")
    .notNull()
    .references(() => models.id),
  versionId: integer("version_id")
    .notNull()
    .references(() => benchmarkVersions.id),
  completedAt: timestamp("completed_at").notNull(),
  harnessCommit: varchar("harness_commit", { length: 64 }).notNull(),
  config: jsonb("config").notNull(),
  status: runStatusEnum("status").notNull().default("imported"),
  /** Admin who imported this run - accountability trail. */
  importedBy: integer("imported_by").references(() => users.id),
  importedAt: timestamp("imported_at").notNull().defaultNow(),
});
export type EvaluationRun = typeof evaluationRuns.$inferSelect;

export const axisResults = pgTable(
  "axis_results",
  {
    id: serial("id").primaryKey(),
    runId: integer("run_id")
      .notNull()
      .references(() => evaluationRuns.id, { onDelete: "cascade" }),
    track: trackEnum("track").notNull(),
    axis: axisEnum("axis").notNull(),
    tier: tierEnum("tier").notNull(),
    score: real("score").notNull(),
    ciLow: real("ci_low"),
    ciHigh: real("ci_high"),
    nItems: integer("n_items").notNull(),
  },
  (t) => [uniqueIndex("axis_results_unique").on(t.runId, t.track, t.axis, t.tier)],
);
export type AxisResultRow = typeof axisResults.$inferSelect;

/** Digital certificates for models that completed a published evaluation. */
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  runId: integer("run_id")
    .notNull()
    .unique()
    .references(() => evaluationRuns.id),
  /** SHA-256 over run id + model + version + all axis scores. */
  verificationHash: varchar("verification_hash", { length: 64 }).notNull().unique(),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  revokedAt: timestamp("revoked_at"),
});
export type Certificate = typeof certificates.$inferSelect;

