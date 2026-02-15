import { describe, it, expect } from "vitest"
import { normalizeKey } from "@/common/utils/normalize-key"

describe("normalizeKey", () => {
  it("should trim and lowercase input", () => {
    expect(normalizeKey("  Test  ")).toBe("test")
  })

  it("should handle null or undefined input", () => {
    // @ts-expect-error - testing null input
    expect(normalizeKey(null)).toBe("")
    // @ts-expect-error - testing undefined input
    expect(normalizeKey(undefined)).toBe("")
  })

  it("should remove emojis", () => {
    expect(normalizeKey("Milk 🥛")).toBe("milk")
  })

  it("should remove punctuation", () => {
    expect(normalizeKey("Milk, Eggs & Bread!")).toBe("milk eggs bread")
  })

  it("should normalize whitespace loops", () => {
    expect(normalizeKey("Milk    Eggs")).toBe("milk eggs")
  })
})
