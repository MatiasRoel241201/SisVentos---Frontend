/**
 * Route Protection Configuration
 * Defines role-based access control for application routes
 */

export type UserRole = 'ADMIN' | 'CAJA' | 'COCINA'

export interface RoutePermissions {
  [route: string]: UserRole[]
}

/**
 * Route permissions mapping
 * Defines which roles can access each route
 */
export const ROUTE_PERMISSIONS: RoutePermissions = {
  '/': ['ADMIN'],
  '/statistics': ['ADMIN'],
  '/cashier': ['ADMIN', 'CAJA'],
  '/kitchen': ['ADMIN', 'COCINA'],
  '/inventory': ['ADMIN'],
  '/sales': ['ADMIN'],
  '/create-event': ['ADMIN'],
  '/create-users': ['ADMIN'],
}

/**
 * Check if a user role has access to a specific route
 * @param userRole - The role of the current user
 * @param route - The route path to check
 * @returns true if the user has access, false otherwise
 */
export function canAccessRoute(userRole: UserRole | null, route: string): boolean {
  // If no user role, deny access
  if (!userRole) return false

  // If route is not in permissions map, deny access by default
  const allowedRoles = ROUTE_PERMISSIONS[route]
  if (!allowedRoles) return false

  // Check if user role is in allowed roles
  return allowedRoles.includes(userRole)
}

/**
 * Get all accessible routes for a given role
 * @param userRole - The role of the current user
 * @returns Array of route paths the user can access
 */
export function getAccessibleRoutes(userRole: UserRole | null): string[] {
  if (!userRole) return []

  return Object.keys(ROUTE_PERMISSIONS).filter(route =>
    ROUTE_PERMISSIONS[route].includes(userRole)
  )
}

/**
 * Get the default landing route for a user role
 * @param userRole - The role of the current user
 * @returns The default route path for the role
 */
export function getDefaultRouteForRole(userRole: UserRole | null): string {
  switch (userRole) {
    case 'ADMIN':
      return '/'
    case 'CAJA':
      return '/cashier'
    case 'COCINA':
      return '/kitchen'
    default:
      return '/login'
  }
}
