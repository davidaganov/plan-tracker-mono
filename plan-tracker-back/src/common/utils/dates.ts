/**
 * Checks if a repeating item's checked state has expired.
 * @param checkedAt - Date when the item was checked
 * @param repeatEveryDays - Number of days to repeat after
 * @returns boolean - true if expired
 */
export function isRepeatExpired(checkedAt: Date | null, repeatEveryDays: number | null): boolean {
  if (!checkedAt || !repeatEveryDays) return false
  const ms = repeatEveryDays * 24 * 60 * 60 * 1000
  return Date.now() - checkedAt.getTime() >= ms
}
