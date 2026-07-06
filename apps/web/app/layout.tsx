import { Geist, Geist_Mono, Inter } from "next/font/google"
import type { Metadata } from "next"

import "@workspace/ui/globals.css"
import { Toaster } from "@workspace/ui/components/sonner"
import { SettingsMenu } from "@workspace/ui/components/settings-menu"
import { I18nProvider } from "@workspace/i18n/provider"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Web App",
  description: "A typical full-stack web application.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <ThemeProvider>
          <I18nProvider>
            <div className="fixed right-4 top-4 z-50">
              <SettingsMenu />
            </div>
            {children}
          </I18nProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
