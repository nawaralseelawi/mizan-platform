/**
 * Statistical helpers for leaderboard scores.
 *
 * Wilson score interval for a binomial proportion. Chosen over the normal
 * (Wald) approximation because it behaves correctly near 0 and 1 and for
 * the small per-axis sample sizes of the pilot bank (n = 20..50), where
 * Wald intervals are known to undercover.
 *
 * Applicability notes (documented for the paper):
 * - Multiple-choice axes (comprehension, knowledge): per-item outcomes are
 *   Bernoulli, so the binomial model is exact and Wilson applies directly.
 * - Official-documents extraction: the per-item score is a field-match
 *   fraction in [0, 1], not a Bernoulli outcome. For any [0, 1]-bounded
 *   variable with mean p, the Bernoulli variance p(1 - p) is the maximum
 *   possible variance, so treating the mean as a binomial proportion yields
 *   a CONSERVATIVE (wider-or-equal) interval. We accept this deliberately
 *   and disclose it.
 * - Human-rubric axes (generation, translation, safety) are NOT binomial;
 *   Wilson must not be applied to them. Callers guard on the axis.
 */

/** Two-sided z for 95% confidence. */
const Z_95 = 1.959963984540054;

export interface WilsonInterval {
  low: number;
  high: number;
}

/**
 * Wilson score interval for k successes out of n trials.
 * Returns bounds as fractions in [0, 1]. Returns null when n <= 0.
 */
export function wilsonInterval(
  k: number,
  n: number,
  z: number = Z_95,
): WilsonInterval | null {
  if (!Number.isFinite(k) || !Number.isFinite(n) || n <= 0) return null;
  const kk = Math.max(0, Math.min(n, k));
  const p = kk / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const half = (z / denom) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
  return {
    low: Math.max(0, center - half),
    high: Math.min(1, center + half),
  };
}

/**
 * Wilson interval from an aggregate score (fraction in [0, 1]) and item
 * count, reconstructing k = round(score * n). This is how stored axis
 * aggregates are converted, since per-item outcomes are not kept in the
 * platform database.
 */
export function wilsonFromScore(
  score: number,
  nItems: number,
): WilsonInterval | null {
  if (!Number.isFinite(score) || nItems <= 0) return null;
  const k = Math.round(score * nItems);
  return wilsonInterval(k, nItems);
}
