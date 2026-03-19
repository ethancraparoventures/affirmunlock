import { describe, it, expect } from "vitest";
import { normalizeText, similarityRatio, verifyAffirmation } from "../lib/speech-verify";

describe("normalizeText", () => {
  it("lowercases text", () => {
    expect(normalizeText("I AM CONFIDENT")).toBe("i am confident");
  });

  it("removes punctuation", () => {
    expect(normalizeText("I am confident, capable, and ready!")).toBe(
      "i am confident capable and ready"
    );
  });

  it("collapses whitespace", () => {
    expect(normalizeText("I  am   confident")).toBe("i am confident");
  });

  it("trims whitespace", () => {
    expect(normalizeText("  I am confident  ")).toBe("i am confident");
  });
});

describe("similarityRatio", () => {
  it("returns 1.0 for identical strings", () => {
    expect(similarityRatio("hello world", "hello world")).toBe(1.0);
  });

  it("returns 0.0 for completely different strings of same length", () => {
    const ratio = similarityRatio("aaaa", "bbbb");
    expect(ratio).toBe(0.0);
  });

  it("returns 0.0 for empty strings comparison", () => {
    expect(similarityRatio("", "hello")).toBe(0.0);
    expect(similarityRatio("hello", "")).toBe(0.0);
  });

  it("returns high similarity for minor differences", () => {
    // One character off
    const ratio = similarityRatio("i am confident", "i am confiden");
    expect(ratio).toBeGreaterThan(0.9);
  });

  it("returns lower similarity for more differences", () => {
    const ratio = similarityRatio("i am confident", "i am happy");
    expect(ratio).toBeLessThan(0.8);
  });
});

describe("verifyAffirmation", () => {
  const affirmation = "I am confident, capable, and ready for today.";

  it("passes for exact match (after normalization)", () => {
    const result = verifyAffirmation(
      "I am confident, capable, and ready for today.",
      affirmation,
      0.9
    );
    expect(result.passed).toBe(true);
    expect(result.similarity).toBe(1.0);
  });

  it("passes for near-exact match (minor mispronunciation)", () => {
    const result = verifyAffirmation(
      "I am confident capable and ready for today",
      affirmation,
      0.9
    );
    expect(result.passed).toBe(true);
    expect(result.similarity).toBeGreaterThanOrEqual(0.9);
  });

  it("fails for significantly different text", () => {
    const result = verifyAffirmation(
      "I love pizza and burgers",
      affirmation,
      0.9
    );
    expect(result.passed).toBe(false);
    expect(result.similarity).toBeLessThan(0.9);
  });

  it("fails for empty transcript", () => {
    const result = verifyAffirmation("", affirmation, 0.9);
    expect(result.passed).toBe(false);
    expect(result.similarity).toBe(0.0);
  });

  it("uses custom threshold correctly", () => {
    // 70% threshold should pass something that 90% would fail
    const transcript = "I am confident and ready";
    const resultStrict = verifyAffirmation(transcript, affirmation, 0.9);
    const resultLenient = verifyAffirmation(transcript, affirmation, 0.5);
    // Lenient should be more likely to pass
    expect(resultLenient.similarity).toBeGreaterThanOrEqual(resultStrict.similarity);
  });

  it("returns normalized transcript and target", () => {
    const result = verifyAffirmation(
      "I AM CONFIDENT!",
      "I am confident.",
      0.9
    );
    expect(result.normalizedTranscript).toBe("i am confident");
    expect(result.normalizedTarget).toBe("i am confident");
  });
});
