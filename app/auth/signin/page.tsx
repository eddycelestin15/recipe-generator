"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"

function SignInContent() {
  const router = useRouter()
  const t = useTranslations()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('auth.invalidCredentials'))
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      setError(t('auth.genericError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.signInTitle')}</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('auth.signInSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-900 dark:text-white">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-gray-900 dark:text-white">{t('auth.password')}</Label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              {t('auth.signingIn')}
            </div>
          ) : (
            t('auth.signIn')
          )}
        </Button>
      </form>

      <div className="text-sm text-center text-gray-600 dark:text-gray-400">
        {t('auth.noAccount')}{" "}
        <Link href="/auth/signup" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">
          {t('auth.signUpFree')}
        </Link>
      </div>
    </div>
  )
}

export default function SignInPage() {
  const t = useTranslations()

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
