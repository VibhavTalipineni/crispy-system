import { CREACGenerator } from '../creac-generator';
import { buildSystemPrompt, buildUserPrompt } from '../prompt';
import { CREACInput } from '../types';

// Mock the Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn(),
      },
    })),
  };
});

import Anthropic from '@anthropic-ai/sdk';

const SAMPLE_INPUT: CREACInput = {
  legalIssue: 'Whether Dan is liable to Paul for battery.',
  factPattern: 'Paul was walking when Dan shoved him from behind. Paul fell and scraped his hands.',
  applicableLaw: 'Battery requires: (a) intent to cause harmful or offensive contact, and (b) harmful contact results.',
};

const SAMPLE_ESSAY_JSON = {
  issue: 'Whether Dan is liable to Paul for battery.',
  initialConclusion: 'Dan is likely liable to Paul for battery.',
  rule: 'Battery requires an intentional act causing harmful or offensive contact.',
  explanation: 'Courts have held that the intent element requires only intent to make contact, not intent to harm.',
  application: 'HERE, the intent element IS SATISFIED BECAUSE Dan intentionally shoved Paul. HERE, the harmful contact element IS SATISFIED BECAUSE Paul fell and scraped his hands.',
  finalConclusion: 'Therefore, Dan is liable for battery because he intentionally shoved Paul, causing harmful contact.',
  elements: [
    {
      name: 'Intent',
      rule: 'The defendant must intend to cause the contact.',
      explanation: 'Intent to contact is sufficient; intent to harm is not required.',
      application: 'HERE, the intent element IS SATISFIED BECAUSE Dan intentionally shoved Paul.',
      satisfied: true,
    },
    {
      name: 'Harmful Contact',
      rule: 'The contact must result in physical harm.',
      explanation: 'Any physical injury, however minor, satisfies the harmful contact element.',
      application: 'HERE, the harmful contact element IS SATISFIED BECAUSE Paul scraped his hands.',
      satisfied: true,
    },
  ],
};

describe('buildSystemPrompt', () => {
  it('includes CREAC methodology description', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('CREAC');
    expect(prompt).toContain('Conclusion');
    expect(prompt).toContain('Rule');
    expect(prompt.toLowerCase()).toContain('explanation');
    expect(prompt).toContain('Application');
  });

  it('instructs to use the HERE paradigm', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('HERE');
  });

  it('specifies the JSON output format', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('initialConclusion');
    expect(prompt).toContain('finalConclusion');
    expect(prompt).toContain('elements');
  });
});

describe('buildUserPrompt', () => {
  it('includes the legal issue', () => {
    const prompt = buildUserPrompt(SAMPLE_INPUT);
    expect(prompt).toContain(SAMPLE_INPUT.legalIssue);
  });

  it('includes the fact pattern', () => {
    const prompt = buildUserPrompt(SAMPLE_INPUT);
    expect(prompt).toContain(SAMPLE_INPUT.factPattern);
  });

  it('includes the applicable law', () => {
    const prompt = buildUserPrompt(SAMPLE_INPUT);
    expect(prompt).toContain(SAMPLE_INPUT.applicableLaw);
  });
});

describe('CREACGenerator', () => {
  let mockCreate: jest.Mock;

  beforeEach(() => {
    mockCreate = jest.fn();
    (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(() => ({
      messages: { create: mockCreate },
    } as unknown as Anthropic));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns an error if factPattern is missing', async () => {
    const generator = new CREACGenerator({ apiKey: 'test-key' });
    const result = await generator.generate({
      legalIssue: 'test',
      factPattern: '',
      applicableLaw: 'test law',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Fact pattern is required');
  });

  it('returns an error if applicableLaw is missing', async () => {
    const generator = new CREACGenerator({ apiKey: 'test-key' });
    const result = await generator.generate({
      legalIssue: 'test',
      factPattern: 'some facts',
      applicableLaw: '',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Applicable law is required');
  });

  it('returns an error if legalIssue is missing', async () => {
    const generator = new CREACGenerator({ apiKey: 'test-key' });
    const result = await generator.generate({
      legalIssue: '',
      factPattern: 'some facts',
      applicableLaw: 'some law',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Legal issue is required');
  });

  it('successfully generates a CREAC essay from valid input', async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify(SAMPLE_ESSAY_JSON),
        },
      ],
    });

    const generator = new CREACGenerator({ apiKey: 'test-key' });
    const result = await generator.generate(SAMPLE_INPUT);

    expect(result.success).toBe(true);
    expect(result.essay).toBeDefined();
    expect(result.essay?.issue).toBe(SAMPLE_ESSAY_JSON.issue);
    expect(result.essay?.initialConclusion).toBe(SAMPLE_ESSAY_JSON.initialConclusion);
    expect(result.essay?.rule).toBe(SAMPLE_ESSAY_JSON.rule);
    expect(result.essay?.explanation).toBe(SAMPLE_ESSAY_JSON.explanation);
    expect(result.essay?.application).toBe(SAMPLE_ESSAY_JSON.application);
    expect(result.essay?.finalConclusion).toBe(SAMPLE_ESSAY_JSON.finalConclusion);
    expect(result.essay?.elements).toHaveLength(2);
    expect(result.essay?.formattedEssay).toContain('CREAC LEGAL ESSAY ANALYSIS');
  });

  it('parses JSON wrapped in markdown code blocks', async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: `Here is the essay:\n\`\`\`json\n${JSON.stringify(SAMPLE_ESSAY_JSON)}\n\`\`\``,
        },
      ],
    });

    const generator = new CREACGenerator({ apiKey: 'test-key' });
    const result = await generator.generate(SAMPLE_INPUT);

    expect(result.success).toBe(true);
    expect(result.essay?.issue).toBe(SAMPLE_ESSAY_JSON.issue);
  });

  it('handles API errors gracefully', async () => {
    mockCreate.mockRejectedValue(new Error('API rate limit exceeded'));

    const generator = new CREACGenerator({ apiKey: 'test-key' });
    const result = await generator.generate(SAMPLE_INPUT);

    expect(result.success).toBe(false);
    expect(result.error).toContain('API rate limit exceeded');
  });

  it('formats the essay with all CREAC sections', async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify(SAMPLE_ESSAY_JSON),
        },
      ],
    });

    const generator = new CREACGenerator({ apiKey: 'test-key' });
    const result = await generator.generate(SAMPLE_INPUT);

    const formatted = result.essay?.formattedEssay ?? '';
    expect(formatted).toContain('CONCLUSION (Initial)');
    expect(formatted).toContain('RULE');
    expect(formatted).toContain('EXPLANATION');
    expect(formatted).toContain('APPLICATION');
    expect(formatted).toContain('CONCLUSION (Final)');
    expect(formatted).toContain('STUDENT GUIDANCE NOTES');
  });

  it('marks satisfied elements with a check mark in formatted output', async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify(SAMPLE_ESSAY_JSON),
        },
      ],
    });

    const generator = new CREACGenerator({ apiKey: 'test-key' });
    const result = await generator.generate(SAMPLE_INPUT);

    expect(result.essay?.formattedEssay).toContain('✅ SATISFIED');
  });

  it('calls the Claude API with the correct model and tokens', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(SAMPLE_ESSAY_JSON) }],
    });

    const generator = new CREACGenerator({
      apiKey: 'test-key',
      model: 'claude-opus-4-5',
      maxTokens: 2048,
    });
    await generator.generate(SAMPLE_INPUT);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-opus-4-5',
        max_tokens: 2048,
      })
    );
  });
});
