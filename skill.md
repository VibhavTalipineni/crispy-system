# Skill: CREAC Legal Essay Generator

## Overview

A Claude-powered skill that generates complete **CREAC** (Conclusion, Rule, Explanation, Application, Conclusion) essay templates for law students. Given a fact pattern, applicable law, and a legal issue, the skill produces a fully structured legal analysis essay with element-by-element breakdowns and student guidance notes.

---

## Skill Details

| Field | Value |
|---|---|
| **Name** | CREAC Legal Essay Generator |
| **Language** | TypeScript (Node.js) |
| **AI Model** | Claude (Anthropic) — default: `claude-opus-4-5` |
| **Entry Point** | `src/index.ts` (CLI) / `src/creac-generator.ts` (API) |

---

## Inputs

| Input | Description | Required |
|---|---|---|
| `legalIssue` | The specific legal question being analyzed (e.g., "Whether Dan is liable to Paul for battery.") | ✅ |
| `factPattern` | The legal scenario and case facts | ✅ |
| `applicableLaw` | Relevant statutes, case holdings, or legal principles governing the issue | ✅ |

---

## Outputs

The skill returns a `CREACEssay` object with the following fields:

| Field | Description |
|---|---|
| `issue` | The legal question analyzed |
| `initialConclusion` | Brief 1–2 sentence answer to the legal issue |
| `rule` | Complete statement of the governing legal rule |
| `explanation` | How courts have interpreted and applied each element |
| `application` | Detailed application of each element to the facts using the HERE paradigm |
| `finalConclusion` | Reinforced conclusion summarizing the analysis |
| `elements` | Array of individual legal elements with rule, explanation, application, and satisfaction status |
| `formattedEssay` | Complete formatted essay text ready to display or export |

### Element satisfaction status

Each element in the `elements` array carries a `satisfied` field:

| Value | Meaning |
|---|---|
| `true` | Element is satisfied based on the facts |
| `false` | Element is not satisfied based on the facts |
| `null` | Genuinely ambiguous — facts support both sides |

---

## How It Works

1. **Input validation** — checks that all three required fields are present before calling the API.
2. **Prompt construction** — a system prompt encodes the full CREAC methodology and instructs Claude to return structured JSON; a user prompt injects the specific fact pattern, law, and issue.
3. **Claude API call** — sends the prompt to Claude via the Anthropic SDK.
4. **Response parsing** — extracts and validates the JSON from Claude's response (handles both raw JSON and markdown code blocks).
5. **Essay formatting** — assembles the structured data into a human-readable essay with section headers, element breakdowns, and student guidance notes.

### Application — the HERE Paradigm

The Application section follows this exact format:

> **HERE, [element] IS/IS NOT SATISFIED BECAUSE [specific facts from the fact pattern].**

This ties every legal element explicitly to the supporting or opposing facts.

---

## Usage

### Prerequisites

- Node.js 18+
- Anthropic API key ([get one](https://console.anthropic.com/))

### Setup

```bash
npm install
export ANTHROPIC_API_KEY=your_api_key_here
```

### Interactive CLI

```bash
npm run dev
```

The CLI will prompt you to either use a built-in example (battery tort) or enter your own fact pattern, law, and issue.

### Programmatic API

```typescript
import { CREACGenerator } from './src/creac-generator';

const generator = new CREACGenerator({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  // model: 'claude-opus-4-5',  // optional
  // maxTokens: 4096,           // optional
});

const result = await generator.generate({
  legalIssue: 'Whether Dan is liable to Paul for battery.',
  factPattern: `Paul was walking when Dan shoved him hard from behind.
Paul fell and scraped his hands and knees. Dan intended to push
Paul but claims he only meant to get his attention.`,
  applicableLaw: `Battery requires: (a) an act intending to cause harmful or
offensive contact AND (b) a harmful contact that results. Intent
to contact is sufficient — intent to harm is not required.
(Vosburg v. Putney, 50 N.W. 403 (Wis. 1891))`,
});

if (result.success && result.essay) {
  console.log(result.essay.formattedEssay);
}
```

---

## Example

**Input:**

- **Issue:** Whether Dan is liable to Paul for battery.
- **Facts:** Dan shoved Paul from behind; Paul fell and scraped his hands and knees.
- **Law:** Battery = intent to cause harmful/offensive contact + harmful contact results.

**Output (abbreviated):**

```
════════════════════════════════════════════════════════════
⚖️  CREAC LEGAL ESSAY ANALYSIS
════════════════════════════════════════════════════════════

📌 ISSUE: Whether Dan is liable to Paul for battery.

────────────────────────────────────────────────────────────
I. CONCLUSION (Initial)
────────────────────────────────────────────────────────────
Dan is likely liable to Paul for battery.

────────────────────────────────────────────────────────────
II. RULE
────────────────────────────────────────────────────────────
Battery requires: (a) intent to cause harmful or offensive contact,
AND (b) harmful contact results.

────────────────────────────────────────────────────────────
III. EXPLANATION
────────────────────────────────────────────────────────────
Courts require only intent to make contact, not intent to cause harm.
(Vosburg v. Putney)

────────────────────────────────────────────────────────────
IV. APPLICATION
────────────────────────────────────────────────────────────
HERE, the intent element IS SATISFIED BECAUSE Dan deliberately shoved Paul.
HERE, the harmful contact element IS SATISFIED BECAUSE Paul sustained physical injuries.

────────────────────────────────────────────────────────────
V. CONCLUSION (Final)
────────────────────────────────────────────────────────────
Dan is liable for battery. Both elements are satisfied.

📋 ELEMENT-BY-ELEMENT BREAKDOWN

1. INTENT — ✅ SATISFIED
2. HARMFUL CONTACT — ✅ SATISFIED

💡 STUDENT GUIDANCE NOTES
• Use the HERE paradigm in Application: "HERE, [element] IS/IS NOT SATISFIED BECAUSE [facts]"
• Address ALL elements even if the conclusion seems obvious
• When facts are ambiguous, argue BOTH sides before concluding
```

---

## File Structure

```
crispy-system/
├── src/
│   ├── index.ts              # Interactive CLI entry point
│   ├── creac-generator.ts    # CREACGenerator class (Claude API integration)
│   ├── prompt.ts             # System prompt + user prompt builder
│   ├── types.ts              # TypeScript interfaces
│   └── __tests__/
│       └── creac-generator.test.ts  # Unit tests
├── skill.md                  # This file
├── README.md                 # Full project documentation
├── package.json
└── tsconfig.json
```

---

## Testing

```bash
npm test
```

15 unit tests cover: input validation, successful generation, JSON parsing (raw and markdown-wrapped), API error handling, essay formatting, element breakdown rendering.

---

## CREAC Methodology Reference

| Section | Purpose | Key Technique |
|---|---|---|
| **Conclusion (Initial)** | Directly answer the legal question | Be brief and declarative |
| **Rule** | State the governing law and all elements | Include every element — omitting one loses points |
| **Explanation** | Show how courts interpret each element | Cite cases or Restatement provisions |
| **Application** | Apply each element to the facts | Use the HERE paradigm for each element |
| **Conclusion (Final)** | Reinforce the analysis | Mirror the initial conclusion with more detail |
