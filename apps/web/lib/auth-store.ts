import type { Tokens, User } from "@workspace/schemas"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  user: User | null
  tokens: Tokens | null
  setAuth: (user: User, tokens: Tokens) => void
  setTokens: (tokens: Tokens) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      setAuth: (user, tokens) => set({ user, tokens }),
      setTokens: (tokens) => set({ tokens }),
      clear: () => set({ user: null, tokens: null }),
    }),
    { name: "web-auth" }
  )
)
