'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useAuth } from '../Context/AuthContext'
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react'
import { getDefaultRouteForRole } from '@/lib/route-protection'
import Image from 'next/image'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(username, password)
      if (success) {
        // Get user from localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          const defaultRoute = getDefaultRouteForRole(parsedUser.role)

          // Pequeño delay para asegurar que el estado se actualice
          setTimeout(() => {
            router.push(defaultRoute)
          }, 100)
        } else {
          router.push('/')
        }
      } else {
        setError('Credenciales inválidas')
      }
    } catch {
      setError('Error al iniciar sesión. Por favor, intente de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#1E2C6D] rounded-full blur-[128px] opacity-20"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-[#D9251C] rounded-full blur-[128px] opacity-20"></div>
      </div>

      <Card className="w-full max-w-md relative bg-white/5 border-white/20 backdrop-blur-xl shadow-2xl">
        {/* Logo/Header */}
        <div className="p-8 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="Logo" width={64} height={64} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">
            Bienvenido
          </h1>
          <p className="text-white/60 text-sm">Ingresa tus credenciales para continuar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Username field */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white/80 text-sm font-medium">
              Usuario
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 focus:border-white/40 focus:ring-2 focus:ring-white/20"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80 text-sm font-medium">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 focus:border-white/40 focus:ring-2 focus:ring-white/20"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-blue text-white font-medium hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="px-8 pb-8 pt-0">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-black/50 px-2 text-white/40">Batallón 1 - Sistema de Gestión</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
