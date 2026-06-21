import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono, DM_Sans, DM_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { MinimalAuthProvider as AuthProvider } from "@/components/auth/minimal-auth-provider"
import { NotificationProvider } from "@/components/notifications/notification-context"
import { RealtimeProvider } from "@/components/supabase/realtime-provider"
import { ThemeProvider } from "@/components/theme-provider"
import ClientLayout from "./client-layout"

const inter = Inter({ subsets: ["latin"], variable: "--inter", display: "swap" })

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--jb-mono",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--dm-sans",
  display: "swap",
})

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--dm-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "InsureTrack - AI-Powered Insurance Portal",
  description: "Comprehensive insurance management portal powered by AI",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${dmSans.variable} ${dmMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <NotificationProvider>
            <AuthProvider>
              <RealtimeProvider>
                <ClientLayout>{children}</ClientLayout>
                <Toaster />
              </RealtimeProvider>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
