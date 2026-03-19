/**
 * Speech verification utilities for AffirmUnlock.
 * Compares a spoken transcript against the target affirmation text
 * using normalized string comparison and Levenshtein-based similarity.
 */

/**
 * Normalize text for comparison:
 * - Lowercase
 * - Remove punctuation
 * - Collapse whitespace
 * - Trim
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Compute Levenshtein edit distance between two strings.
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Compute similarity ratio between two strings (0.0 to 1.0).
 * Uses normalized Levenshtein distance.
 */
export function similarityRatio(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length === 0 || b.length === 0) return 0.0;
  const dist = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return 1 - dist / maxLen;
}

export interface VerificationResult {
  passed: boolean;
  similarity: number;
  normalizedTranscript: string;
  normalizedTarget: string;
}

/**
 * Verify whether a spoken transcript matches the target affirmation.
 *
 * @param transcript - The raw speech-to-text output
 * @param target - The affirmation text to match against
 * @param threshold - Minimum similarity ratio to pass (default: 0.90)
 */
export function verifyAffirmation(
  transcript: string,
  target: string,
  threshold = 0.9
): VerificationResult {
  const normalizedTranscript = normalizeText(transcript);
  const normalizedTarget = normalizeText(target);

  const similarity = similarityRatio(normalizedTranscript, normalizedTarget);
  const passed = similarity >= threshold;

  return {
    passed,
    similarity,
    normalizedTranscript,
    normalizedTarget,
  };
}
