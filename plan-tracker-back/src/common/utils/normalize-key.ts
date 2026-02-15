export const normalizeKey = (input: string): string => {
  const trimmed = (input ?? "").trim().toLowerCase()
  const withoutEmoji = trimmed.replace(/\p{Extended_Pictographic}/gu, " ")
  const withoutPunctuation = withoutEmoji.replace(/[^\p{L}\p{N}\s]/gu, " ")

  return withoutPunctuation.replace(/\s+/g, " ").trim()
}
