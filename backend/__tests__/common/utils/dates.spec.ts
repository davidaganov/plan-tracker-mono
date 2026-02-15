import { describe, it, expect } from "vitest"
import { isRepeatExpired } from "@/common/utils/dates"

describe("Dates Utils", () => {
  describe("isRepeatExpired", () => {
    it("should return false if checkedAt is null", () => {
      expect(isRepeatExpired(null, 7)).toBe(false)
    })

    it("should return false if repeatDays is null", () => {
      expect(isRepeatExpired(new Date(), null)).toBe(false)
    })

    it("should return true if time elapsed > repeat period", () => {
      const checkedAt = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
      expect(isRepeatExpired(checkedAt, 7)).toBe(true)
    })

    it("should return false if time elapsed < repeat period", () => {
      const checkedAt = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
      expect(isRepeatExpired(checkedAt, 7)).toBe(false)
    })
  })
})
