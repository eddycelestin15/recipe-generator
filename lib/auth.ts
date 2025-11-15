import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"
import { connectToDatabase } from "./db/db-client"
import { UserModel } from "./db/schemas/user.schema"

// MongoDB client for NextAuth adapter
const client = mongoose.connection.getClient()

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(client),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        await connectToDatabase()

        // Find user with password field included
        const user = await UserModel.findOne({
          email: credentials.email.toString().toLowerCase()
        }).select('+password')

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password.toString(),
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
      }

      // Handle session update
      if (trigger === "update" && session) {
        return { ...token, ...session.user }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string

        // Fetch latest user data
        await connectToDatabase()
        const user = await UserModel.findById(token.id)

        if (user) {
          session.user.onboardingCompleted = user.onboardingCompleted
          session.user.profile = user.profile
          session.user.settings = user.settings
        }
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectToDatabase()

        // Check if user exists
        const existingUser = await UserModel.findOne({ email: user.email })

        if (existingUser && !existingUser.provider) {
          // Update existing credentials user to OAuth
          existingUser.provider = "google"
          existingUser.image = user.image
          await existingUser.save()
        }
      }

      return true
    }
  },
  debug: process.env.NODE_ENV === "development",
})

// Helper to get current session
export async function getSession() {
  return await auth()
}

// Helper to get current user
export async function getCurrentUser() {
  const session = await getSession()

  if (!session?.user?.id) {
    return null
  }

  await connectToDatabase()
  const user = await UserModel.findById(session.user.id)

  if (!user) {
    return null
  }

  return user.toObject()
}
