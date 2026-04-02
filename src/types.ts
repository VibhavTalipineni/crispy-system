/**
 * Type definitions for the CREAC Legal Essay Generator
 */

/** Input data required to generate a CREAC essay */
export interface CREACInput {
  /** The legal scenario and case facts */
  factPattern: string;
  /** Applicable statutes, case holdings, or legal principles */
  applicableLaw: string;
  /** The specific legal issue or question being analyzed */
  legalIssue: string;
}

/** A single legal element with its rule and application to facts */
export interface LegalElement {
  /** Name or label of the legal element */
  name: string;
  /** Rule statement for this element */
  rule: string;
  /** How this element has been interpreted in prior cases */
  explanation: string;
  /** Application of the element to the given facts */
  application: string;
  /** Whether this element is satisfied based on the facts */
  satisfied: boolean | null;
}

/** The complete CREAC essay output */
export interface CREACEssay {
  /** The legal issue being analyzed */
  issue: string;
  /** Initial conclusion answering the legal issue */
  initialConclusion: string;
  /** Statement of the governing legal rule */
  rule: string;
  /** Explanation of how the rule has been interpreted */
  explanation: string;
  /** Detailed application of the rule to the specific facts */
  application: string;
  /** Final conclusion reinforcing the analysis */
  finalConclusion: string;
  /** Individual legal elements identified and analyzed */
  elements: LegalElement[];
  /** Formatted full essay text */
  formattedEssay: string;
}

/** Configuration for the CREAC generator */
export interface GeneratorConfig {
  /** Anthropic API key */
  apiKey: string;
  /** Claude model to use */
  model?: string;
  /** Maximum tokens for the response */
  maxTokens?: number;
}

/** Result from the Claude API call */
export interface GenerationResult {
  /** Whether generation was successful */
  success: boolean;
  /** The generated CREAC essay, if successful */
  essay?: CREACEssay;
  /** Error message, if generation failed */
  error?: string;
}
