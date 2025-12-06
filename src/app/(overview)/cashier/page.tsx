'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import CajaDashboard from '@/components/Dashboard/Cashier'

export default function CajaPage() {
  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'CAJA']}>
      <CajaDashboard />
    </ProtectedRoute>
  )
}
