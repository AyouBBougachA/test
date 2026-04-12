"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { I18nProvider } from "@/lib/i18n"
import { AuthProvider } from "@/lib/auth-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
