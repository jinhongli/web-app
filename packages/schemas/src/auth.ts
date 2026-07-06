import { z } from "zod"

import { userSchema } from "./user"

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(64),
  password: z.string().min(8).max(128),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const tokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type Tokens = z.infer<typeof tokensSchema>

export const authResultSchema = z.object({
  user: userSchema,
  tokens: tokensSchema,
})

export type AuthResult = z.infer<typeof authResultSchema>

export const refreshSchema = z.object({
  refreshToken: z.string(),
})

export type RefreshInput = z.infer<typeof refreshSchema>
