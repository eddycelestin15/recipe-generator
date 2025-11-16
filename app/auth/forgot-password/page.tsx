"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resetLink, setResetLink] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to process request")
        setLoading(false)
        return
      }

      setSuccess(true)
      if (data.resetLink) {
        setResetLink(data.resetLink)
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {success ? "Check Your Email" : "Forgot Password?"}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {success
            ? "We've sent you instructions to reset your password"
            : "Enter your email address and we'll send you a link to reset your password"}
        </p>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
            <div className="text-green-600 dark:text-green-400 text-5xl mb-3">✓</div>
            <p className="text-green-800 dark:text-green-400 font-medium mb-2">
              Password reset email sent!
            </p>
            <p className="text-green-700 dark:text-green-500 text-sm">
              If an account exists for <strong>{email}</strong>, you will receive password reset instructions.
            </p>
          </div>

          {resetLink && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-400 font-medium mb-2 text-sm">
                Development Mode: Email not configured
              </p>
              <p className="text-blue-700 dark:text-blue-500 text-xs mb-3">
                Click the link below to reset your password:
              </p>
              <Link href={resetLink}>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Reset Password Now
                </Button>
              </Link>
            </div>
          )}

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={() => setSuccess(false)}
              className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
            >
              try again
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-900 dark:text-white">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-11"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11 text-base bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      )}

      <div className="text-center">
        <Link href="/auth/signin" className="text-sm text-orange-600 dark:text-orange-400 hover:underline font-medium">
          ← Back to Sign In
        </Link>
      </div>
    </div>
  )
}
