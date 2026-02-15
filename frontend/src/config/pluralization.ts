/**
 * Pluralization rules for Slavic languages (Russian, Ukrainian, etc.).
 * Choice index mapping:
 * 0: zero (e.g. 0 items)
 * 1: one (e.g. 1 item, 21 items) - singular nominative
 * 2: few (e.g. 2 items, 22 items) - singular genitive
 * 3: many (e.g. 5 items, 11 items) - plural genitive
 */
export function slavicPluralizationRule(choice: number, choicesLength: number): number {
  if (choice === 0) {
    return 0
  }

  const teen = choice % 100 > 10 && choice % 100 < 20
  const endsWithOne = choice % 10 === 1
  const endsWithTwoToFour = choice % 10 >= 2 && choice % 10 <= 4

  if (choicesLength < 4) {
    // Fallback if fewer choices provided
    return !teen && endsWithOne ? 1 : 2
  }

  if (!teen && endsWithOne) return 1 // one
  if (!teen && endsWithTwoToFour) return 2 // few

  return 3 // many
}
