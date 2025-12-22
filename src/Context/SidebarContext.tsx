"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface SidebarContextType {
    isCollapsed: boolean
    setIsCollapsed: (value: boolean) => void
    toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarCollapseProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    const toggleCollapsed = () => setIsCollapsed(prev => !prev)

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleCollapsed }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebarCollapse() {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error("useSidebarCollapse must be used within a SidebarCollapseProvider")
    }
    return context
}
