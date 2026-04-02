# CREAC Legal Essay Generator ⚖️

A Claude-powered skill that helps law students generate complete **CREAC** (Conclusion, Rule, Explanation, Application, Conclusion) essay templates from fact patterns and applicable law.

---

## What is CREAC?

CREAC is the standard framework for legal analysis used in law school exams and legal writing:

| Section | Description |
|---|---|
| **C**onclusion (Initial) | Brief answer to the legal issue raised |
| **R**ule | Statement of the governing legal rule and all its elements |
| **E**xplanation | How courts have interpreted and applied each element |
| **A**pplication | Applying each element to the specific facts using the **HERE** paradigm |
| **C**onclusion (Final) | Reinforcing the analysis and restating the conclusion |

---

## Features

- ✅ Accepts fact patterns, applicable law, and a legal issue as input
- ✅ Identifies all legal elements within the applicable rule
- ✅ Generates structured CREAC essays with all five sections
- ✅ Uses the **HERE paradigm** for applications: _"HERE, [element] IS/IS NOT SATISFIED BECAUSE [facts]"_
- ✅ Provides element-by-element breakdown with satisfaction status
- ✅ Includes guidance notes for law students
- ✅ Built-in example (battery tort) to help first-time users
- ✅ TypeScript with full type safety

---

## Requirements

- **Node.js** 18+
- **Anthropic API key** ([get one here](https://console.anthropic.com/))

---

## Installation

```bash
git clone https://github.com/VibhavTalipineni/crispy-system.git
cd crispy-system
npm install
```

---

## Usage

### Set your API key

```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

### Run the CLI (interactive mode)

```bash
npm run dev
```

You'll be prompted to either:
1. Use a built-in example (battery tort fact pattern), or
2. Enter your own fact pattern, law, and legal issue

### Build and run

```bash
npm run build
npm start
```

### Use the generator programmatically

```typescript
import { CREACGenerator } from './src/creac-generator';

const generator = new CREACGenerator({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const result = await generator.generate({
  legalIssue: 'Whether Dan is liable to Paul for battery.',
  factPattern: `Paul was walking down the street when Dan shoved him hard in the back.
Paul stumbled and fell, scraping his hands and knees. Dan intended to push Paul
but claims he only meant to get his attention.`,
  applicableLaw: `Battery requires: (a) an act intending to cause harmful or offensive contact,
AND (b) a harmful or offensive contact that directly or indirectly results.
The intent element requires only intent to make contact, not intent to cause harm.
(Vosburg v. Putney, 50 N.W. 403 (Wis. 1891))`,
});

if (result.success && result.essay) {
  console.log(result.essay.formattedEssay);
}
```

---

## Example Output

```
════════════════════════════════════════════════════════════
⚖️  CREAC LEGAL ESSAY ANALYSIS
════════════════════════════════════════════════════════════

📌 ISSUE: Whether Dan is liable to Paul for battery.

────────────────────────────────────────────────────────────
I. CONCLUSION (Initial)
────────────────────────────────────────────────────────────

Dan is likely liable to Paul for battery because he intentionally shoved Paul,
causing harmful contact.

────────────────────────────────────────────────────────────
II. RULE
────────────────────────────────────────────────────────────

Under the Restatement (Second) of Torts § 13, battery requires: (a) an act
intending to cause a harmful or offensive contact with the person, AND (b) a
harmful contact with the person that directly or indirectly results.

────────────────────────────────────────────────────────────
III. EXPLANATION
────────────────────────────────────────────────────────────

Courts have consistently held that the intent element of battery requires only
that the actor intend the contact itself — not that they intend to cause harm or
injury. In Vosburg v. Putney, the court held that a schoolboy who kicked a
classmate was liable for battery even though he did not intend to injure him,
because he intended the contact. The harmful contact element is satisfied by any
physical pain or injury, however minor.

────────────────────────────────────────────────────────────
IV. APPLICATION
────────────────────────────────────────────────────────────

HERE, the intent element IS SATISFIED BECAUSE Dan deliberately approached Paul
and shoved him hard in the back — this was an intentional act, not an accident.
Although Dan claims he only meant to get Paul's attention, courts require only
intent to make contact, not intent to cause harm. Dan clearly intended the shove.

HERE, the harmful contact element IS SATISFIED BECAUSE Paul fell and scraped his
hands and knees as a direct result of Dan's shove. The physical injuries, even
though minor, constitute harmful contact under the Restatement standard.

────────────────────────────────────────────────────────────
V. CONCLUSION (Final)
────────────────────────────────────────────────────────────

Dan is liable to Paul for battery. Both elements are satisfied: Dan intentionally
shoved Paul (satisfying the intent element) and Paul sustained physical injuries
as a result (satisfying the harmful contact element). Dan's claim that he did not
intend to harm Paul is legally irrelevant.

════════════════════════════════════════════════════════════
💡 STUDENT GUIDANCE NOTES
════════════════════════════════════════════════════════════

• The Application section uses the "HERE" paradigm: "HERE, [element] IS/IS NOT SATISFIED BECAUSE [facts]"
• Each element of the rule should be addressed separately in the Application
• The initial and final Conclusions should mirror each other but the final should be more detailed
• In exams, always address ALL elements even if the conclusion seems obvious
• When facts are ambiguous, argue BOTH sides before reaching your conclusion
════════════════════════════════════════════════════════════
```

---

## API Reference

### `CREACGenerator`

```typescript
new CREACGenerator(config: GeneratorConfig)
```

**Config options:**

| Option | Type | Required | Description |
|---|---|---|---|
| `apiKey` | `string` | ✅ | Your Anthropic API key |
| `model` | `string` | ❌ | Claude model (default: `claude-opus-4-5`) |
| `maxTokens` | `number` | ❌ | Max response tokens (default: `4096`) |

### `generator.generate(input: CREACInput): Promise<GenerationResult>`

**Input:**

| Field | Type | Description |
|---|---|---|
| `factPattern` | `string` | The legal scenario and case facts |
| `applicableLaw` | `string` | Applicable statutes, case holdings, or legal principles |
| `legalIssue` | `string` | The specific legal question being analyzed |

**Result:**

| Field | Type | Description |
|---|---|---|
| `success` | `boolean` | Whether generation succeeded |
| `essay` | `CREACEssay` | The generated essay (if successful) |
| `error` | `string` | Error message (if unsuccessful) |

---

## Running Tests

```bash
npm test
```

---

## Project Structure

```
crispy-system/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── creac-generator.ts    # Core generation logic (Claude API)
│   ├── prompt.ts             # Prompt engineering
│   ├── types.ts              # TypeScript type definitions
│   └── __tests__/
│       └── creac-generator.test.ts  # Unit tests
├── package.json
├── tsconfig.json
└── README.md
```

---

## CREAC Methodology Tips

1. **Always start with the Rule** — courts apply rules, not facts
2. **Break the rule into elements** — analyze each one separately
3. **Use the HERE paradigm in Application** — "HERE, [element] IS SATISFIED BECAUSE [specific facts]"
4. **Address ALL elements** — even obvious ones (this shows thoroughness on exams)
5. **Argue both sides when facts are ambiguous** — reach a conclusion, but acknowledge the tension
6. **Mirror your Conclusions** — the Final Conclusion should reinforce the Initial Conclusion with more detail

---

## License

MIT