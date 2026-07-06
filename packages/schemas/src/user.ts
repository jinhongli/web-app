import { z } from "zod"

export const userRoleSchema = z.enum(["user", "admin"])

export type UserRole = z.infer<typeof userRoleSchema>

export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().min(1).max(64),
  role: userRoleSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type User = z.infer<typeof userSchema>

export const updateUserSchema = z.object({
  name: z.string().min(1).max(64).optional(),
  role: userRoleSchema.optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>
