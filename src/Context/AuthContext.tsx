'use client'

import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react'
import { User } from '@/lib/types'
import { authService } from '@/services/auth/authService'
import { canAccessRoute } from '@/lib/route-protection'
import Image from 'next/image'

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  canAccess: (route: string) => boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Función para limpiar la sesión
  const clearSession = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }
  }

  // Función para configurar el refresh automático de tokens
  const setupTokenRefresh = useCallback(() => {
    // Limpiar intervalo anterior si existe
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    // Refresh cada 30 minutos (token dura 2 horas)
    refreshIntervalRef.current = setInterval(async () => {
      try {
        const currentToken = localStorage.getItem('token')
        if (currentToken) {
          const response = await authService.checkAuthStatus(currentToken)

          // Actualizar token renovado
          localStorage.setItem('token', response.token)

          // Actualizar usuario en el estado
          setUser(prev => prev ? { ...prev, token: response.token } : null)

          console.log('Token renovado exitosamente')
        }
      } catch (error) {
        console.error('Error al renovar token:', error)
        // Si falla la renovación, cerrar sesión
        clearSession()
        window.location.href = '/login'
      }
    }, 30 * 60 * 1000) // 30 minutos
  }, [])

  // Restaurar sesión al montar el componente
  useEffect(() => {
    const restoreSession = async () => {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('token')

      if (storedUser && storedToken) {
        try {
          // Validar que el token siga siendo válido
          const response = await authService.checkAuthStatus(storedToken)

          // Token válido, restaurar sesión con datos frescos
          const userData = JSON.parse(storedUser)
          setUser({ ...userData, token: response.token })

          // Actualizar token si el backend devolvió uno nuevo
          if (response.token !== storedToken) {
            localStorage.setItem('token', response.token)
          }

          // Configurar refresh automático
          setupTokenRefresh()
        } catch (error) {
          console.error('Token inválido o expirado:', error)
          // Token inválido, limpiar sesión
          clearSession()
        }
      }

      setIsLoading(false)
    }

    restoreSession()

    // Limpiar intervalo al desmontar
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [setupTokenRefresh])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Use authService to communicate with real backend
      const response = await authService.login(username, password)

      // Extract data from backend response (now includes role!)
      const { id, userName, token, role } = response

      // Create user object (ignore password hash from backend)
      // Map backend role to frontend role type
      // Backend: 'admin' | 'cajero' | 'cocina'
      // Frontend: 'ADMIN' | 'CAJA' | 'COCINA'
      const roleMap: Record<string, 'ADMIN' | 'CAJA' | 'COCINA'> = {
        'admin': 'ADMIN',
        'cajero': 'CAJA',
        'cocina': 'COCINA'
      }

      // Validar que el rol venga del backend y exista en el roleMap
      if (!role) throw new Error('El backend no proporcionó un rol para el usuario')

      const mappedRole = roleMap[role]
      if (!mappedRole) throw new Error(`Rol desconocido recibido del backend: ${role}`)

      const userData: User = {
        id,
        username: userName,
        role: mappedRole,
        token
      }

      // Save to localStorage (persists between sessions)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify({
        id,
        username: userName,
        role: mappedRole
      }))

      // Update state
      setUser(userData)

      // Configurar refresh automático de tokens
      setupTokenRefresh()

      return true
    } catch (error) {
      console.error('Error durante el login:', error)
      return false
    }
  }

  const logout = (): void => {
    clearSession()
  }

  const canAccess = (route: string): boolean => {
    return canAccessRoute(user?.role || null, route)
  }

  // Mostrar loading mientras se valida la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Image src="/logo.png" alt="Loading" width={100} height={100} className='mb-2' />
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, canAccess, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')

  return context
}