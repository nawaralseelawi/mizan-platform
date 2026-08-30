/**
 * Mizan shared domain types.
 *
 * This file is the single source of truth for the data contract between:
 *   - Sumer JSONL exports (benchmark items)
 *   - The offline evaluation runner (lm-evaluation-harness wrapper)
 *   - This platform (importers, API, UI)
 *
 * Enum values mirror the Mizan Genome metadata specification. Changing any
 * enum here is a methodological decision, not a refactor - it must be
 * reflected in the genome document first.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Core enums (Genome, Section 2 + Section 3)
// ---------------------------------------------------------------------------

export const TRACKS = ["arabic", "iraqi"] as const;
export const TrackSchema = z.enum(TRACKS);
export type Track = z.infer<typeof TrackSchema>;

export const AXES = [
  "comprehension",
  "generation",
  "translation",
  "knowledge",
  "official_documents",
  "safety",
] as const;
export const AxisSchema = z.enum(AXES);
export type Axis = z.infer<typeof AxisSchema>;

export const QUESTION_FORMATS = [
  "multiple_choice",
  "open_generation",
  "extraction",
] as const;
export const QuestionFormatSchema = z.enum(QUESTION_FORMATS);
export type QuestionFormat = z.infer<typeof QuestionFormatSchema>;

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export const DifficultySchema = z.enum(DIFFICULTIES);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const DIALECT_REGIONS = [
  "baghdadi",
  "southern",
  "maslawi",
  "mixed",
  "msa",
] as const;
export const DialectRegionSchema = z.enum(DIALECT_REGIONS);
export type DialectRegion = z.infer<typeof DialectRegionSchema>;

export const CONTAMINATION_TIERS = ["public_dev", "private_test"] as const;
export const ContaminationTierSchema = z.enum(CONTAMINATION_TIERS);
export type ContaminationTier = z.infer<typeof ContaminationTierSchema>;

// ---------------------------------------------------------------------------
// Benchmark item (as exported from Sumer in JSONL, one object per line)
// ---------------------------------------------------------------------------

const ItemBase = z.object({
  /** Stable identifier assigned by Sumer, e.g. "MZN-0001". */
  item_id: z.string().min(1).max(64),
  /** Evaluation track: general Arabic or Iraqi-specific. */
  track: TrackSchema,
  axis: AxisSchema,
  question_format: QuestionFormatSchema,
  difficulty: DifficultySchema,
  dialect_region: DialectRegionSchema,
  contamination_tier: ContaminationTierSchema,
  /** The prompt shown to the model. Iraqi Arabic content lives here. */
  prompt: z.string().min(1),
  /** Optional context passage (e.g. an official document for axis 5). */
  context: z.string().optional(),
  /** Free-form provenance / reviewer notes. Never shown to models. */
  notes: z.string().optional(),
});

const MultipleChoiceItem = ItemBase.extend({
  question_format: z.literal("multiple_choice"),
  choices: z.array(z.string().min(1)).min(2).max(5),
  /** Zero-based index into `choices`. */
  correct_answer: z.number().int().min(0),
}).superRefine((item, ctx) => {
  if (item.correct_answer >= item.choices.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["correct_answer"],
      message: `correct_answer index ${item.correct_answer} out of range for ${item.choices.length} choices`,
    });
  }
});

const ExtractionItem = ItemBase.extend({
  question_format: z.literal("extraction"),
  /** Ground-truth key-value pairs, e.g. { issuer, ref_number, date, request }. */
  ground_truth: z.record(z.string(), z.string()).refine(
    (gt) => Object.keys(gt).length > 0,
    { message: "ground_truth must contain at least one field" },
  ),
});

const OpenGenerationItem = ItemBase.extend({
  question_format: z.literal("open_generation"),
  /** Identifier of the human-judging rubric this item is scored against. */
  rubric_id: z.string().min(1),
  /** Optional reference output for judge calibration. Not an answer key. */
  reference: z.string().optional(),
});

export const BenchmarkItemSchema = z.discriminatedUnion("question_format", [
  MultipleChoiceItem.sourceType(),
  ExtractionItem,
  OpenGenerationItem,
]);
export type BenchmarkItem = z.infer<typeof BenchmarkItemSchema>;

/**
 * Zod's discriminatedUnion cannot take a refined schema directly, so the
 * multiple-choice range check is re-applied at parse time via this wrapper.
 * Always validate items through `parseBenchmarkItem`, never the raw union.
 */
export function parseBenchmarkItem(raw: unknown):
  | { ok: true; item: BenchmarkItem }
  | { ok: false; errors: string[] } {
  const first = BenchmarkItemSchema.safeParse(raw);
  if (!first.success) {
    return { ok: false, errors: formatZodErrors(first.error) };
  }
  if (first.data.question_format === "multiple_choice") {
    const second = MultipleChoiceItem.safeParse(raw);
    if (!second.success) {
      return { ok: false, errors: formatZodErrors(second.error) };
    }
  }
  const errors: string[] = [];
  // Track consistency rules:
  // - translation axis is Iraqi-track only (MSA <-> Iraqi by definition)
  // - Arabic-track items must be MSA region (no dialect content there)
  if (first.data.axis === "translation" && first.data.track !== "iraqi") {
    errors.push("axis: translation axis belongs to the iraqi track only");
  }
  if (first.data.track === "arabic" && first.data.dialect_region !== "msa") {
    errors.push(
      "dialect_region: arabic-track items must use dialect_region \"msa\"",
    );
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, item: first.data };
}

function formatZodErrors(error: z.ZodError): string[] {
  return error.issues.map(
    (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
  );
}

// ---------------------------------------------------------------------------
// Evaluation results (produced offline by the harness wrapper, imported here)
// ---------------------------------------------------------------------------

export const AxisResultSchema = z.object({
  track: TrackSchema,
  axis: AxisSchema,
  /** Primary score in [0, 1]. Accuracy for MC, mean rubric score for generation. */
  score: z.number().min(0).max(1),
  /** 95% confidence interval bounds, when computed. */
  ci_low: z.number().min(0).max(1).optional(),
  ci_high: z.number().min(0).max(1).optional(),
  /** Number of items this axis score aggregates over. */
  n_items: z.number().int().positive(),
  /** Which tier produced this score. Leaderboard uses private_test only. */
  tier: ContaminationTierSchema,
});
export type AxisResult = z.infer<typeof AxisResultSchema>;

export const EvaluationResultsFileSchema = z
  .object({
    schema_version: z.literal("mizan-results-v1"),
    model: z.object({
      name: z.string().min(1),
      developer: z.string().min(1),
      /** e.g. "70B", "8x7B". Free text; normalized at display time. */
      parameters: z.string().optional(),
      license: z.string().optional(),
      /** API endpoint or HF repo id used for the run. */
      source: z.string().optional(),
    }),
    benchmark_version: z.string().min(1),
    run: z.object({
      /** ISO 8601 timestamp of run completion. */
      completed_at: z.string().datetime(),
      /** Git commit of the harness wrapper for reproducibility. */
      harness_commit: z.string().min(1),
      /** Inference settings: temperature, few-shot count, etc. */
      config: z.record(z.string(), z.unknown()),
    }),
    results: z.array(AxisResultSchema).min(1),
  })
  .superRefine((file, ctx) => {
    const seen = new Set<string>();
    for (const [i, r] of file.results.entries()) {
      const key = `${r.track}:${r.axis}:${r.tier}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["results", i],
          message: `duplicate result for track "${r.track}" axis "${r.axis}" tier "${r.tier}"`,
        });
      }
      seen.add(key);
      if (r.ci_low !== undefined && r.ci_high !== undefined && r.ci_low > r.ci_high) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["results", i],
          message: "ci_low must not exceed ci_high",
        });
      }
    }
  });
export type EvaluationResultsFile = z.infer<typeof EvaluationResultsFileSchema>;

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const USER_ROLES = ["viewer", "maintainer", "admin"] as const;
export const UserRoleSchema = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const CredentialsSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(10).max(128),
});
export type Credentials = z.infer<typeof CredentialsSchema>;

