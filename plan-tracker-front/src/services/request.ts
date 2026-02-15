import WebApp from "@twa-dev/sdk"
import type { ApiError, ApiRequestOptions } from "@/types/api"

/**
 * Base API configuration
 */
export const API_CONFIG = {
  baseURL: (() => {
    const configured = import.meta.env.VITE_API_URL
    if (!configured) return window.location.origin

    if (configured.startsWith("/")) {
      return new URL(configured, window.location.origin).toString()
    }

    return configured
  })(),
  timeout: 10000
}

/**
 * Build URL with query parameters
 */
const buildURL = (endpoint: string, params?: Record<string, string | number | boolean>): string => {
  const url = new URL(endpoint, API_CONFIG.baseURL)

  if (params && Object.keys(params).length > 0) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  return url.toString()
}

/**
 * Create request headers
 */
const createHeaders = (options: ApiRequestOptions): Record<string, string> => {
  const headers: Record<string, string> = {
    ...options.headers
  }

  // Set Content-Type only when there is a body to send
  if (options.body) {
    headers["Content-Type"] = "application/json"
  }

  // Get initData from options or directly from Telegram SDK
  const initData = options.initData || WebApp.initData

  // Add Telegram WebApp authentication header
  if (initData) {
    headers["x-telegram-init-data"] = initData
    headers["tg-init-data"] = initData
  }

  return headers
}

const DATE_KEYS = new Set([
  "createdAt",
  "updatedAt",
  "checkedAt",
  "usedAt",
  "expiresAt",
  "joinedAt"
])

const reviveDates = (value: unknown): unknown => {
  if (value == null) return value

  if (Array.isArray(value)) {
    return value.map(reviveDates)
  }

  if (typeof value !== "object") return value

  const obj = value as Record<string, unknown>
  for (const [k, v] of Object.entries(obj)) {
    if (DATE_KEYS.has(k) && typeof v === "string") {
      const dt = new Date(v)
      if (!Number.isNaN(dt.getTime())) {
        obj[k] = dt
        continue
      }
    }

    obj[k] = reviveDates(v)
  }

  return obj
}

/**
 * API request function
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const { method = "GET", params, body, timeout = API_CONFIG.timeout } = options

  // Build URL with params
  const url = buildURL(endpoint, params)

  // Create headers
  const headers = createHeaders(options)

  // Create AbortController for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw {
        message: `HTTP error! status: ${response.status}`,
        status: response.status,
        statusText: response.statusText,
        data: errorText
      } as ApiError
    }

    const contentType = response.headers.get("content-type")

    if (contentType?.includes("application/json")) {
      const data = await response.json()
      return reviveDates(data) as T
    } else {
      return (await response.text()) as unknown as T
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw {
          message: "Request timeout",
          status: 408,
          statusText: "Request Timeout"
        } as ApiError
      }

      throw {
        message: error.message,
        status: 0,
        statusText: "Network Error"
      } as ApiError
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * HTTP method shortcuts
 */
export const request = {
  get: <T>(endpoint: string, options?: Omit<ApiRequestOptions, "method">) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">
  ) => apiRequest<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">
  ) => apiRequest<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">
  ) => apiRequest<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: Omit<ApiRequestOptions, "method">) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" })
}
