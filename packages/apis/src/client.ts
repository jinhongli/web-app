import { apiErrorSchema } from "@workspace/schemas/common"
import type { ZodType } from "zod"

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3528"

export class ApiRequestError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = "ApiRequestError"
    this.status = status
    this.code = code
  }
}

export interface RequestOptions<TBody> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: TBody
  token?: string
  query?: Record<string, string | number | undefined>
  signal?: AbortSignal
}

function buildUrl(
  path: string,
  query?: RequestOptions<unknown>["query"]
): string {
  const url = new URL(path, API_BASE_URL)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

/**
 * Thin fetch wrapper. Validates the response payload against `schema`
 * so callers always receive typed, verified data.
 */
export async function apiFetch<TResponse, TBody = unknown>(
  path: string,
  schema: ZodType<TResponse>,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const { method = "GET", body, token, query, signal } = options

  const headers: Record<string, string> = {}
  if (body !== undefined) {
    headers["Content-Type"] = "application/json"
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })

  const text = await response.text()
  const payload: unknown = text ? JSON.parse(text) : undefined

  if (!response.ok) {
    const parsed = apiErrorSchema.safeParse(payload)
    if (parsed.success) {
      throw new ApiRequestError(
        response.status,
        parsed.data.code,
        parsed.data.message
      )
    }
    throw new ApiRequestError(
      response.status,
      "unknown",
      response.statusText || "Request failed"
    )
  }

  return schema.parse(payload)
}
