import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/presentation/store/auth.store'

interface ProtectedRouteProps {
  /** Contenido a renderizar si la autorización es correcta. */
  children: ReactNode
  /**
   * Si es true, además de estar autenticado el usuario debe tener
   * is_staff o is_superuser = true.
   */
  requireStaff?: boolean
  /**
   * Si se indica, el usuario debe pertenecer a este grupo/comisión
   * (o ser superusuario). Ej: "Comision Tecnica".
   */
  requireGroup?: string
}

/**
 * Ruta protegida por autenticación y opcionalmente por rol/grupo.
 *
 * Comportamiento:
 * - No autenticado → redirige a /login guardando la ruta actual
 * - Autenticado pero sin permisos → redirige a /admin
 * - Autorizado → renderiza children
 */
export default function ProtectedRoute({
  children,
  requireStaff = false,
  requireGroup,
}: ProtectedRouteProps) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)

  // Mientras loadSession() está en curso, no redirigir aún
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Sin autenticar: ir al login guardando la ruta de origen
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verificación de staff
  if (requireStaff && !user.is_staff && !user.is_superuser) {
    return <Navigate to="/admin" replace />
  }

  // Verificación de grupo/comisión
  if (requireGroup && !user.is_superuser && !user.groups.includes(requireGroup)) {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
