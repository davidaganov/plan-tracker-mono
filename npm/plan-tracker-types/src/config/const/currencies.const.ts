/**
 * List of supported currencies.
 */
export const CURRENCIES = [
  { code: "RUB", symbol: "₽" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" }
] as const

/**
 * Type representing a currency code.
 */
export type CurrencyCode = (typeof CURRENCIES)[number]["code"]
