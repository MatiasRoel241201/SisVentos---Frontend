'use client'

import Start from '@/components/Start'
import ProtectedRoute from "@/components/ProtectedRoute"

export default function Home() {
  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <Start />
    </ProtectedRoute>
  )
}
