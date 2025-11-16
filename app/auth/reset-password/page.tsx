"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"

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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {success ? "Password Reset!" : "Reset Your Password"}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {success
            ? "Your password has been successfully reset"
            : "Enter your new password below"}
        </p>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <div className="text-green-600 dark:text-green-400 text-5xl mb-3">✓</div>
            <p className="text-green-800 dark:text-green-400 font-medium mb-2">
              Password successfully reset!
            </p>
            <p className="text-green-700 dark:text-green-500 text-sm">
              You can now sign in with your new password.
            </p>
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Redirecting to sign in...
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-900 dark:text-white">New Password</Label>
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Must be at least 8 characters long</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-white">Confirm New Password</Label>
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
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 text-base bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
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

      {!success && (
        <div className="text-center">
          <Link href="/auth/signin" className="text-sm text-orange-600 dark:text-orange-400 hover:underline font-medium">
            ← Back to Sign In
          </Link>
        </div>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
