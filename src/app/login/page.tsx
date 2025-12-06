import LoginForm from '@/components/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Acceso al sistema de pedidos',
}

export default function LoginPage() {
  return <LoginForm />
}

