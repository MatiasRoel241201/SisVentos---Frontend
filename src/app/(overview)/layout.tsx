'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/sidebar'
import { SidebarCollapseProvider, useSidebarCollapse } from '@/Context/SidebarContext'

function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarCollapse()

  return (
    <main
      className="flex-1 p-6 transition-all duration-300"
      style={{ marginLeft: isCollapsed ? '64px' : '256px' }}
    >
      {children}
    </main>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarCollapseProvider>
      <SidebarProvider>
        <AppSidebar />
        <MainContent>{children}</MainContent>
      </SidebarProvider>
    </SidebarCollapseProvider>
  )
}