import { DefaultSession } from "next-auth"
import { UserProfile, UserSettings } from "@/lib/db/models"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      onboardingCompleted?: boolean
      profile?: UserProfile
      settings?: UserSettings
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    onboardingCompleted?: boolean
    profile?: UserProfile
    settings?: UserSettings
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    onboardingCompleted?: boolean
  }
}
