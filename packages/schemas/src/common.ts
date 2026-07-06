import { z } from "zod"

/** Standard API envelope returned by the Go backend. */
export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
})

export type ApiError = z.infer<typeof apiErrorSchema>

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
})

export type Pagination = z.infer<typeof paginationSchema>

export function paginatedSchema<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
  })
}
