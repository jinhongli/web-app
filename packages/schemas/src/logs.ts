import { z } from "zod"

import { paginationSchema } from "./common"

export const logLevelSchema = z.enum(["debug", "info", "warn", "error"])
export type LogLevel = z.infer<typeof logLevelSchema>

export const requestLogSchema = z.object({
  id: z.string(),
  traceId: z.string(),
  level: logLevelSchema,
  message: z.string(),
  method: z.string(),
  path: z.string(),
  status: z.number().int(),
  latencyMs: z.number().int(),
  ip: z.string(),
  userId: z.string(),
  attrs: z.string(),
  createdAt: z.iso.datetime(),
})

export type RequestLog = z.infer<typeof requestLogSchema>

export const logQuerySchema = paginationSchema.extend({
  keyword: z.string().optional(),
  userId: z.string().optional(),
  level: logLevelSchema.optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
})

export type LogQuery = z.infer<typeof logQuerySchema>

export const logChainSchema = z.object({
  traceId: z.string(),
  items: z.array(requestLogSchema),
})

export type LogChain = z.infer<typeof logChainSchema>
