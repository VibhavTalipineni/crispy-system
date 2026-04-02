import * as readline from 'readline';
import { CREACGenerator } from './creac-generator';
import { CREACInput } from './types';

/** Example fact pattern for first-time users */
const EXAMPLE_INPUT: CREACInput = {
  legalIssue: 'Whether Dan is liable to Paul for battery.',
  factPattern: `Paul was walking down the street when Dan, who was angry at him over a business dispute,
approached from behind and shoved Paul hard in the back. Paul stumbled and fell, scraping his
hands and knees on the pavement. Dan intended to push Paul but claims he only meant to get
his attention, not to hurt him. Paul suffered minor injuries requiring a doctor's visit.`,
  applicableLaw: `Battery is an intentional tort. Under the Restatement (Second) of Torts § 13, an actor
is subject to liability for battery if:
(a) he acts intending to cause a harmful or offensive contact with the person of the other or
    a third person, or an imminent apprehension of such contact, AND
(b) a harmful contact with the person of the other directly or indirectly results.

The intent element requires only that the actor intend the contact itself, NOT that they
intend to cause harm. (Vosburg v. Putney, 50 N.W. 403 (Wis. 1891)).
A contact is "harmful" if it causes physical pain, injury, or illness.`,
};

/**
 * Prompts the user for a line of input.
 */
function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

/**
 * Collects multi-line input until the user enters an empty line.
 */
async function collectMultilineInput(rl: readline.Interface, label: string): Promise<string> {
  console.log(`\n${label} (press Enter twice when done):`);
  const lines: string[] = [];
  while (true) {
    const line = await prompt(rl, '');
    if (line === '' && lines.length > 0 && lines[lines.length - 1] === '') {
      lines.pop(); // Remove the trailing blank line
      break;
    }
    lines.push(line);
  }
  return lines.join('\n').trim();
}

/**
 * Displays the example input so users can see the expected format.
 */
function showExample(): void {
  console.log(`
${'═'.repeat(60)}
📖 EXAMPLE INPUT
${'═'.repeat(60)}

LEGAL ISSUE:
${EXAMPLE_INPUT.legalIssue}

FACT PATTERN:
${EXAMPLE_INPUT.factPattern}

APPLICABLE LAW:
${EXAMPLE_INPUT.applicableLaw}

${'═'.repeat(60)}
`);
}

/**
 * Main CLI entry point for the CREAC Essay Generator.
 */
async function main(): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: ANTHROPIC_API_KEY environment variable is not set.');
    console.error('   Set it with: export ANTHROPIC_API_KEY=your_api_key_here');
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`
${'═'.repeat(60)}
⚖️  CREAC LEGAL ESSAY GENERATOR
   Powered by Claude AI
${'═'.repeat(60)}

This tool generates complete CREAC (Conclusion, Rule, Explanation,
Application, Conclusion) essay templates to help law students
master legal analysis methodology.
`);

  const choice = await prompt(rl, 'Would you like to (1) use an example or (2) enter your own facts? [1/2]: ');

  let input: CREACInput;

  if (choice.trim() === '1') {
    showExample();
    input = EXAMPLE_INPUT;
    console.log('Using example input...\n');
  } else {
    input = {
      legalIssue: await collectMultilineInput(rl, '📌 LEGAL ISSUE (e.g., "Whether Dan is liable for battery")'),
      factPattern: await collectMultilineInput(rl, '📄 FACT PATTERN (the legal scenario/case facts)'),
      applicableLaw: await collectMultilineInput(rl, '📚 APPLICABLE LAW (statutes, case holdings, legal principles)'),
    };
  }

  rl.close();

  console.log('\n⏳ Generating your CREAC essay... (this may take a moment)\n');

  const generator = new CREACGenerator({ apiKey });
  const result = await generator.generate(input);

  if (!result.success || !result.essay) {
    console.error(`\n❌ Generation failed: ${result.error}`);
    process.exit(1);
  }

  console.log(result.essay.formattedEssay);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
