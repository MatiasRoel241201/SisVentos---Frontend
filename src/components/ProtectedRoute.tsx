'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/Context/AuthContext'
import { canAccessRoute, getDefaultRouteForRole } from '@/lib/route-protection'
import { useToast } from '@/hooks/use-toast'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRoles: Array<'ADMIN' | 'CAJA' | 'COCINA'>
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const { toast } = useToast()
    const hasShownToast = useRef(false)
    const isFirstCheck = useRef(true)

    useEffect(() => {
        // Don't check permissions while still loading
        if (isLoading) return

        // Check if user is authenticated
        if (!user) {
            router.push('/login')
            return
        }

        // Check if user has required role
        if (!canAccessRoute(user.role, pathname)) {
            // Solo mostrar toast si no es la primera verificación
            // Esto evita mostrar el toast durante el proceso de login
            if (!isFirstCheck.current && !hasShownToast.current) {
                toast({
                    title: 'Acceso Denegado',
                    description: 'No tienes permisos para acceder a esta página.',
                    variant: 'destructive',
                })
                hasShownToast.current = true
            }

            // Redirect to user's default route instead of home
            const defaultRoute = getDefaultRouteForRole(user.role)
            router.push(defaultRoute)
            return
        }

        // Marcar que ya pasó la primera verificación
        isFirstCheck.current = false
    }, [user, isLoading, pathname, router, toast])

    // Reset flags when pathname changes
    useEffect(() => {
        hasShownToast.current = false
        isFirstCheck.current = true
    }, [pathname])

    // While checking auth, don't render anything
    if (isLoading || !user) return null

    // If user doesn't have access, don't render (will redirect)
    if (!canAccessRoute(user.role, pathname)) return null

    // If user passes all checks, render children
    return <>{children}</>
}
