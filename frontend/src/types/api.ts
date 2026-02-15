export type ApiError = {
  message: string
  status: number
  statusText: string
  data?: unknown
}

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  params?: Record<string, string | number | boolean>
  body?: unknown
  timeout?: number
  headers?: Record<string, string>
  initData?: string
}
