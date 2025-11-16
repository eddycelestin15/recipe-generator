"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (!token) {
      setError("Invalid or missing reset token")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to reset password")
        setLoading(false)
        return
      }

      setSuccess(true)
      // Redirect to signin after 2 seconds
      setTimeout(() => {
        router.push("/auth/signin")
      }, 2000)
    } catch (error) {
      setError("An error occurred. Please try again.")
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
            {success ? "Password Reset!" : "Reset Your Password"}
          </CardTitle>
          <CardDescription className="text-center text-base text-gray-600">
            {success
              ? "Your password has been successfully reset"
              : "Enter your new password below"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
                <div className="text-emerald-600 text-5xl mb-3">✓</div>
                <p className="text-emerald-800 font-medium mb-2">
                  Password successfully reset!
                </p>
                <p className="text-emerald-700 text-sm">
                  You can now sign in with your new password.
                </p>
              </div>

              <div className="text-center text-sm text-gray-600">
                Redirecting to sign in...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading || !token}
                  className="h-11"
                />
                <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={loading || !token}
                  className="h-11"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base"
                disabled={loading || !token}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Resetting Password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-6 border-t">
          {!success && (
            <Link href="/auth/signin" className="text-sm text-emerald-600 hover:underline font-medium">
              ← Back to Sign In
            </Link>
          )}

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
