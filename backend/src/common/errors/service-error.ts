/**
 * Custom error class for service layer errors.
 * These errors are automatically converted to HTTP errors by the error handler plugin.
 */
export class ServiceError extends Error {
  constructor(
    public readonly type: "NotFound" | "Forbidden" | "BadRequest",
    message: string
  ) {
    super(message)
    this.name = "ServiceError"
  }

  static notFound(message: string): ServiceError {
    return new ServiceError("NotFound", message)
  }

  static forbidden(message: string): ServiceError {
    return new ServiceError("Forbidden", message)
  }

  static badRequest(message: string): ServiceError {
    return new ServiceError("BadRequest", message)
  }
}
