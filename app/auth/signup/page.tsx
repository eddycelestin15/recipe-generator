"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Checkbox } from "@/app/components/ui/checkbox"

export default function SignUpPage() {
  const router = useRouter()
  const t = useTranslations()

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
      setError(t('auth.termsRequired'))
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'))
      return
    }

    if (formData.password.length < 8) {
      setError(t('auth.passwordTooShort'))
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError(t('auth.invalidEmail'))
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
        setError(data.error || t('auth.createAccountFailed'))
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
        setError(t('auth.createAccountSignInFailed'))
        setLoading(false)
      } else {
        // Redirect to onboarding
        router.push("/auth/onboarding")
      }
    } catch (error) {
      setError(t('auth.genericError'))
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.signUpTitle')}</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('auth.signUpSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-900 dark:text-white">{t('auth.fullName')}</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder={t('auth.fullNamePlaceholder')}
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-900 dark:text-white">{t('auth.email')}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-900 dark:text-white">{t('auth.password')}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={t('auth.confirmPasswordPlaceholder')}
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            className="h-11"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('auth.passwordMinLength')}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-white">{t('auth.confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder={t('auth.confirmPasswordPlaceholder')}
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
            {t('auth.termsAcceptance')}{" "}
            <Link href="/legal/terms" target="_blank" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">
              {t('auth.termsLink')}
            </Link>
            {" "}{t('auth.and')}{" "}
            <Link href="/legal/privacy" target="_blank" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">
              {t('auth.privacyLink')}
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
              {t('auth.creatingAccount')}
            </div>
          ) : (
            t('auth.createAccount')
          )}
        </Button>
      </form>

      <div className="space-y-3">
        <div className="text-sm text-center text-gray-600 dark:text-gray-400">
          {t('auth.hasAccount')}{" "}
          <Link href="/auth/signin" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">
            {t('auth.signIn')}
          </Link>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center border border-orange-100 dark:border-orange-800">
          <p className="text-sm text-orange-800 dark:text-orange-400 font-medium">
            {t('auth.freePlanNotice')}
          </p>
          <p className="text-xs text-orange-700 dark:text-orange-500 mt-1">
            {t('auth.freePlanDesc')}
          </p>
        </div>
      </div>
    </div>
  )
}
