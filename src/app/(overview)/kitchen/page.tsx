'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import CocinaDashboard from '@/components/Dashboard/Kitchen'

export default function CocinaPage() {
  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'COCINA']}>
      <CocinaDashboard />
    </ProtectedRoute>
  )
}
