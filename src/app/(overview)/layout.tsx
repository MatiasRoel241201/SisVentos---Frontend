'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-6" style={{ marginLeft: '256px' }}>
        {children}
      </main>
    </SidebarProvider>
  )
}