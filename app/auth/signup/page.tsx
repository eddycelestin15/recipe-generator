"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Checkbox } from "@/app/components/ui/checkbox"

export default function SignUpPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.acceptTerms) {
      setError("You must accept the Terms & Conditions and Privacy Policy to continue")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)

    try {
      // Create account
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create account")
        setLoading(false)
        return
      }

      // Sign in after successful signup
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Account created but failed to sign in. Please try signing in manually.")
        setLoading(false)
      } else {
        // Redirect to onboarding
        router.push("/auth/onboarding")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Start your journey to better health
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-900 dark:text-white">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-900 dark:text-white">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-900 dark:text-white">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Minimum 8 characters"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            className="h-11"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Must be at least 8 characters long</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-white">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
            className="h-11"
          />
        </div>

        {/* Terms acceptance checkbox */}
        <div className="flex items-start space-x-3 pt-2">
          <Checkbox
            id="acceptTerms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, acceptTerms: checked as boolean })
            }
            disabled={loading}
            className="mt-0.5"
          />
          <Label
            htmlFor="acceptTerms"
            className="text-sm font-normal text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer"
          >
            I agree to the{" "}
            <Link href="/legal/terms" target="_blank" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">
              Terms & Conditions
            </Link>
            {" "}and{" "}
            <Link href="/legal/privacy" target="_blank" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">
              Privacy Policy
            </Link>
          </Label>
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
              Creating account...
            </div>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="space-y-3">
        <div className="text-sm text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">
            Sign in
          </Link>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center border border-orange-100 dark:border-orange-800">
          <p className="text-sm text-orange-800 dark:text-orange-400 font-medium">
            Free Forever Plan
          </p>
          <p className="text-xs text-orange-700 dark:text-orange-500 mt-1">
            No credit card required. Upgrade anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
