import {
  authResultSchema,
  tokensSchema,
  type AuthResult,
  type LoginInput,
  type RegisterInput,
  type Tokens,
} from "@workspace/schemas/auth"

import { apiFetch } from "./client"

export function login(input: LoginInput): Promise<AuthResult> {
  return apiFetch("/api/auth/login", authResultSchema, {
    method: "POST",
    body: input,
  })
}

export function register(input: RegisterInput): Promise<AuthResult> {
  return apiFetch("/api/auth/register", authResultSchema, {
    method: "POST",
    body: input,
  })
}

export function refresh(refreshToken: string): Promise<Tokens> {
  return apiFetch("/api/auth/refresh", tokensSchema, {
    method: "POST",
    body: { refreshToken },
  })
}
