import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata } from "next"

import "@workspace/ui/globals.css"
import { I18nProvider } from "@workspace/i18n/provider"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { ThemeProvider } from "@/components/theme-provider"
import { Separator } from "@workspace/ui/components/separator"
import { LanguageMenu, ThemeMenu } from "@workspace/ui/components/settings-menu"
import { cn } from "@workspace/ui/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Web App Docs",
  description: "API reference and database schema for the Web App backend.",
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
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>
          <I18nProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/60 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                    orientation="vertical"
                    className="mr-2 h-4! self-center"
                  />
                  <PageBreadcrumb />
                  <div className="ml-auto flex items-center gap-1">
                    <LanguageMenu />
                    <ThemeMenu />
                  </div>
                </header>
                {children}
              </SidebarInset>
            </SidebarProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
