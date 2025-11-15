"use client"

import { useSession } from "next-auth/react"
import { User } from "@/lib/db/models"

export function useUser() {
  const { data: session, status, update } = useSession()

  return {
    user: session?.user as User | undefined,
    isLoading: status === "loading",
    isAuthenticated: !!session?.user,
    updateSession: update,
  }
}
