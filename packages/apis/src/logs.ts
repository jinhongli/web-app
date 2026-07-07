import { paginatedSchema } from "@workspace/schemas/common"
import {
  logChainSchema,
  requestLogSchema,
  type LogLevel,
  type RequestLog,
} from "@workspace/schemas/logs"

import { apiFetch } from "./client"

const logsPageSchema = paginatedSchema(requestLogSchema)

export function getLogs(
  token: string,
  params: {
    page?: number
    pageSize?: number
    keyword?: string
    userId?: string
    level?: LogLevel
    from?: string
    to?: string
  } = {}
) {
  return apiFetch("/api/logs", logsPageSchema, {
    token,
    query: {
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword,
      userId: params.userId,
      level: params.level,
      from: params.from,
      to: params.to,
    },
  })
}

export function getLog(token: string, id: string): Promise<RequestLog> {
  return apiFetch(`/api/logs/${id}`, requestLogSchema, { token })
}

export function getLogChain(token: string, id: string) {
  return apiFetch(`/api/logs/${id}/chain`, logChainSchema, { token })
}
