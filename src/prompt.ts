import { CREACInput } from './types';

/**
 * Builds the system prompt that instructs Claude on how to generate CREAC essays.
 */
export function buildSystemPrompt(): string {
  return `You are an expert legal writing assistant specializing in the CREAC methodology used in law school.
Your role is to help law students generate complete, well-structured CREAC essays given a fact pattern and applicable law.

CREAC stands for:
- **C**onclusion (Initial): A brief answer to the legal issue raised
- **R**ule: A statement of the relevant legal rule or principle
- **E**xplanation: How courts have interpreted and applied the rule
- **A**pplication: Applying the rule to the specific facts (format: "HERE, [ELEMENT] IS/IS NOT SATISFIED BECAUSE [FACTS]")
- **C**onclusion (Final): Reinforcing the analysis and restating the conclusion

GUIDELINES:
1. Identify all legal elements or requirements within the rule
2. For each element, explicitly tie it to supporting or opposing facts
3. Use the deductive paradigm: General Rule → Specific Facts → Conclusion
4. Use precise legal language appropriate for law school exams
5. Format the Application section using the "HERE" paradigm: "HERE, [the element] is [satisfied/not satisfied] because [specific facts from the fact pattern]."
6. Be thorough but concise — every sentence should serve a purpose
7. Identify when facts are ambiguous and note both sides of the argument

OUTPUT FORMAT:
Return a JSON object with the following structure:
{
  "issue": "The specific legal question being analyzed",
  "initialConclusion": "Brief 1-2 sentence answer to the legal issue",
  "rule": "Complete statement of the governing legal rule including all elements",
  "explanation": "How courts have interpreted and applied each element of the rule, with reference to illustrative cases or principles",
  "application": "Detailed paragraph applying each element to the specific facts, using the HERE paradigm",
  "finalConclusion": "1-2 sentence final conclusion reinforcing the analysis",
  "elements": [
    {
      "name": "Element name",
      "rule": "Rule statement for this element",
      "explanation": "How this element has been interpreted",
      "application": "HERE, this element IS/IS NOT SATISFIED because [specific facts]",
      "satisfied": true/false/null (null if genuinely ambiguous)
    }
  ]
}`;
}

/**
 * Builds the user-facing prompt with the specific fact pattern, law, and issue.
 */
export function buildUserPrompt(input: CREACInput): string {
  return `Please generate a complete CREAC essay for the following:

**LEGAL ISSUE:**
${input.legalIssue}

**FACT PATTERN:**
${input.factPattern}

**APPLICABLE LAW / RULES:**
${input.applicableLaw}

Generate a thorough CREAC essay that:
1. Identifies all elements of the applicable rule
2. Explains each element with reference to how courts interpret them
3. Applies EVERY element to the specific facts using the "HERE" paradigm
4. Clearly states whether each element is satisfied based on the facts
5. Reaches a well-supported conclusion

Return the result as a JSON object following the specified format.`;
}
