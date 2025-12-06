'use client'

import './globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/Context/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from 'next-themes'

const queryClient = new QueryClient()

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider attribute="class">
              {children}
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}

