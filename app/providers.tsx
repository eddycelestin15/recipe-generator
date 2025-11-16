"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { useEffect, useState } from "react"
import { NextIntlClientProvider } from "next-intl"
import LocaleProvider from "./components/LocaleProvider"
import SessionLoadingProvider from "./components/SessionLoadingProvider"

export function Providers({
  children,
  locale,
  messages
}: {
  children: React.ReactNode
  locale: string
  messages: any
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <SessionProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LocaleProvider>
            <SessionLoadingProvider>
              {children}
            </SessionLoadingProvider>
          </LocaleProvider>
          <Toaster
          position={isMobile ? "top-center" : "bottom-right"}
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
            },
            className: 'toast',
          }}
          richColors
          closeButton
          duration={4000}
        />
        </ThemeProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  )
}
