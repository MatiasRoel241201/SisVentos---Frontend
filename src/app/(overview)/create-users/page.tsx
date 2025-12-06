'use client'

import UserManagement from '@/features/users/components/UserManagement'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function UsuariosDashboard() {
  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <UserManagement />
    </ProtectedRoute>
  )
}
