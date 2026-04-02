import Anthropic from '@anthropic-ai/sdk';
import { CREACInput, CREACEssay, GeneratorConfig, GenerationResult, LegalElement } from './types';
import { buildSystemPrompt, buildUserPrompt } from './prompt';

const DEFAULT_MODEL = 'claude-opus-4-5';
const DEFAULT_MAX_TOKENS = 4096;

/**
 * Formats the CREAC essay into a readable text document.
 */
function formatEssay(essay: Omit<CREACEssay, 'formattedEssay'>): string {
  const divider = '─'.repeat(60);

  const elementBreakdown = essay.elements.length > 0
    ? `\n${divider}\n📋 ELEMENT-BY-ELEMENT BREAKDOWN\n${divider}\n\n` +
      essay.elements.map((el: LegalElement, i: number) => {
        const status = el.satisfied === true
          ? '✅ SATISFIED'
          : el.satisfied === false
            ? '❌ NOT SATISFIED'
            : '⚖️  AMBIGUOUS';
        return `${i + 1}. ${el.name.toUpperCase()} — ${status}\n\n` +
          `   Rule: ${el.rule}\n\n` +
          `   Explanation: ${el.explanation}\n\n` +
          `   Application: ${el.application}\n`;
      }).join(`\n${'-'.repeat(40)}\n\n`)
    : '';

  return `${'═'.repeat(60)}
⚖️  CREAC LEGAL ESSAY ANALYSIS
${'═'.repeat(60)}

📌 ISSUE: ${essay.issue}

${divider}
I. CONCLUSION (Initial)
${divider}

${essay.initialConclusion}

${divider}
II. RULE
${divider}

${essay.rule}

${divider}
III. EXPLANATION
${divider}

${essay.explanation}

${divider}
IV. APPLICATION
${divider}

${essay.application}

${divider}
V. CONCLUSION (Final)
${divider}

${essay.finalConclusion}
${elementBreakdown}
${'═'.repeat(60)}
💡 STUDENT GUIDANCE NOTES
${'═'.repeat(60)}

• The Application section uses the "HERE" paradigm: "HERE, [element] IS/IS NOT SATISFIED BECAUSE [facts]"
• Each element of the rule should be addressed separately in the Application
• The initial and final Conclusions should mirror each other but the final should be more detailed
• In exams, always address ALL elements even if the conclusion seems obvious
• When facts are ambiguous, argue BOTH sides before reaching your conclusion
${'═'.repeat(60)}`;
}

/**
 * Parses the raw JSON response from Claude into a structured CREACEssay object.
 */
function parseEssayResponse(rawContent: string): CREACEssay {
  // Extract JSON from the response (Claude sometimes wraps it in markdown code blocks)
  const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
    rawContent.match(/(\{[\s\S]*\})/);

  if (!jsonMatch) {
    throw new Error('Could not extract JSON from Claude response');
  }

  const parsed = JSON.parse(jsonMatch[1]);

  // Validate required fields
  const required = ['issue', 'initialConclusion', 'rule', 'explanation', 'application', 'finalConclusion'];
  for (const field of required) {
    if (!parsed[field]) {
      throw new Error(`Missing required field in response: ${field}`);
    }
  }

  const essayData: Omit<CREACEssay, 'formattedEssay'> = {
    issue: parsed.issue,
    initialConclusion: parsed.initialConclusion,
    rule: parsed.rule,
    explanation: parsed.explanation,
    application: parsed.application,
    finalConclusion: parsed.finalConclusion,
    elements: parsed.elements || [],
  };

  return {
    ...essayData,
    formattedEssay: formatEssay(essayData),
  };
}

/**
 * Main CREAC essay generator class that interfaces with the Claude API.
 */
export class CREACGenerator {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;

  constructor(config: GeneratorConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model || DEFAULT_MODEL;
    this.maxTokens = config.maxTokens || DEFAULT_MAX_TOKENS;
  }

  /**
   * Generates a complete CREAC essay for the given legal scenario.
   */
  async generate(input: CREACInput): Promise<GenerationResult> {
    if (!input.factPattern?.trim()) {
      return { success: false, error: 'Fact pattern is required' };
    }
    if (!input.applicableLaw?.trim()) {
      return { success: false, error: 'Applicable law is required' };
    }
    if (!input.legalIssue?.trim()) {
      return { success: false, error: 'Legal issue is required' };
    }

    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: buildSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: buildUserPrompt(input),
          },
        ],
      });

      const textContent = message.content.find(block => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        return { success: false, error: 'No text content in Claude response' };
      }

      const essay = parseEssayResponse(textContent.text);
      return { success: true, essay };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Generation failed: ${errorMessage}` };
    }
  }
}
