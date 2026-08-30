/**
 * Client-side benchmark constants and hooks shared by the shell pages.
 * Dual-track structure: general Arabic + Iraqi-specific. Labels mirror
 * the Mizan Genome (as amended 2026-07-21 by the project owner).
 */
import type { Axis, Track } from "@shared/types";
import { trpc } from "./trpc";

export const TRACK_ORDER: Track[] = ["arabic", "iraqi"];

export const TRACK_LABELS: Record<Track, { name: string; short: string }> = {
  arabic: { name: "General Arabic", short: "Arabic" },
  iraqi: { name: "Iraqi Arabic", short: "Iraqi" },
};

export const AXIS_ORDER: Axis[] = [
  "comprehension",
  "generation",
  "translation",
  "knowledge",
  "official_documents",
  "safety",
];

/** Axes applicable per track (translation is Iraqi-only: MSA <-> Iraqi). */
export const TRACK_AXES: Record<Track, Axis[]> = {
  arabic: [
    "comprehension",
    "generation",
    "knowledge",
    "official_documents",
    "safety",
  ],
  iraqi: [
    "comprehension",
    "generation",
    "translation",
    "knowledge",
    "official_documents",
    "safety",
  ],
};

export const AXIS_LABELS: Record<
  Axis,
  { name: string; short: string; description: string }
> = {
  comprehension: {
    name: "Comprehension",
    short: "Comprehension",
    description:
      "Understanding written Arabic - Modern Standard on the Arabic track, and Iraqi Arabic across its regional varieties on the Iraqi track.",
  },
  generation: {
    name: "Generation",
    short: "Generation",
    description:
      "Producing natural, correct Arabic (MSA or Iraqi by track), scored by human judges against unified rubrics.",
  },
  translation: {
    name: "MSA-Iraqi Translation",
    short: "Translation",
    description:
      "Faithful translation between Modern Standard Arabic and Iraqi Arabic in both directions. Iraqi track only.",
  },
  knowledge: {
    name: "Knowledge",
    short: "Knowledge",
    description:
      "Command of Arab and Iraqi geography, history, society, and culture - general Arab knowledge on the Arabic track, Iraq-specific on the Iraqi track.",
  },
  official_documents: {
    name: "Official Documents",
    short: "Documents",
    description:
      "Reading official Arabic correspondence and extracting its fields accurately: issuer, reference, date, subject.",
  },
  safety: {
    name: "Safety",
    short: "Safety",
    description:
      "Model behavior in sensitive contexts: accuracy, neutrality, and context-aware refusal of harmful content.",
  },
};

export function useLatestVersion(): {
  label: string | null;
  isLoading: boolean;
} {
  const versions = trpc.benchmark.versions.useQuery();
  const last = versions.data?.[versions.data.length - 1];
  return { label: last?.label ?? null, isLoading: versions.isLoading };
}

