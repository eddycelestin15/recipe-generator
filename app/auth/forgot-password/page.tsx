"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 pb-6">
          <Link href="/" className="text-emerald-600 text-xl font-bold flex items-center gap-2 justify-center mb-4">
            <span className="text-2xl">🍳</span>
            Recipe Health
          </Link>
          <CardTitle className="text-3xl font-bold text-center text-gray-900">
            {success ? "Check Your Email" : "Forgot Password?"}
          </CardTitle>
          <CardDescription className="text-center text-base text-gray-600">
            {success
              ? "We've sent you instructions to reset your password"
              : "Enter your email address and we'll send you a link to reset your password"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                <div className="text-emerald-600 text-5xl mb-3">✓</div>
                <p className="text-emerald-800 font-medium mb-2">
                  Password reset email sent!
                </p>
                <p className="text-emerald-700 text-sm">
                  If an account exists for <strong>{email}</strong>, you will receive password reset instructions.
                </p>
              </div>

              {resetLink && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-medium mb-2 text-sm">
                    ⚠️ Development Mode: Email not configured
                  </p>
                  <p className="text-blue-700 text-xs mb-3">
                    Click the link below to reset your password:
                  </p>
                  <Link href={resetLink}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Reset Password Now
                    </Button>
                  </Link>
                </div>
              )}

              <div className="text-center text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setSuccess(false)}
                  className="text-emerald-600 hover:underline font-medium"
                >
                  try again
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
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
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
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
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-6 border-t">
          <Link href="/auth/signin" className="text-sm text-emerald-600 hover:underline font-medium">
            ← Back to Sign In
          </Link>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/legal/terms" className="hover:text-emerald-600 hover:underline">
              Terms
            </Link>
            <span>•</span>
            <Link href="/legal/privacy" className="hover:text-emerald-600 hover:underline">
              Privacy
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
