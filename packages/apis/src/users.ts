import { z } from "zod"

import { paginatedSchema } from "@workspace/schemas/common"
import {
  userSchema,
  type UpdateUserInput,
  type User,
} from "@workspace/schemas/user"

import { apiFetch } from "./client"

const usersPageSchema = paginatedSchema(userSchema)

export function getUsers(
  token: string,
  params: { page?: number; pageSize?: number } = {}
) {
  return apiFetch("/api/users", usersPageSchema, {
    token,
    query: { page: params.page, pageSize: params.pageSize },
  })
}

export function getUserById(token: string, id: string): Promise<User> {
  return apiFetch(`/api/users/${id}`, userSchema, { token })
}

export function updateUser(
  token: string,
  id: string,
  input: UpdateUserInput
): Promise<User> {
  return apiFetch(`/api/users/${id}`, userSchema, {
    method: "PATCH",
    token,
    body: input,
  })
}

export function getCurrentUser(token: string): Promise<User> {
  return apiFetch("/api/users/me", userSchema, { token })
}

export function deleteUser(token: string, id: string): Promise<void> {
  return apiFetch(`/api/users/${id}`, z.void(), {
    method: "DELETE",
    token,
  })
}
