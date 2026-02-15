import { describe, it, expect } from "vitest"
import { ServiceError } from "@/common/errors/service-error"

describe("ServiceError", () => {
  it("should create NotFound error", () => {
    const err = ServiceError.notFound("Item missing")
    expect(err.message).toBe("Item missing")
    expect(err.type).toBe("NotFound")
    expect(err).toBeInstanceOf(ServiceError)
  })

  it("should create Forbidden error", () => {
    const err = ServiceError.forbidden("Go away")
    expect(err.message).toBe("Go away")
    expect(err.type).toBe("Forbidden")
  })

  it("should create BadRequest error", () => {
    const err = ServiceError.badRequest("Invalid input")
    expect(err.message).toBe("Invalid input")
    expect(err.type).toBe("BadRequest")
  })

  it("should have correct name via base constructor", () => {
    const err = new ServiceError("BadRequest", "msg")
    expect(err.name).toBe("ServiceError")
    expect(err.type).toBe("BadRequest")
    expect(err.message).toBe("msg")
  })
})
