import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Shield } from 'lucide-react'

import { useAuthStore } from '@/presentation/store/auth.store'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'

// ─── Schema de validación ─────────────────────────────────────────────────────

const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: z
    .string()
    .min(4, 'La contraseña debe tener al menos 4 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

// ─── Componente ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Destino al que redirigir tras login (si vinieron de una ruta protegida)
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/admin'

  const { login, isLoading, error, clearError, user } = useAuthStore()

  // Si ya está autenticado, redirigir directamente
  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, from, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    clearError()
    try {
      await login(data.username, data.password)
      navigate(from, { replace: true })
    } catch {
      // El error ya está en el store
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex items-center gap-2 rounded-full bg-primary p-3 text-primary-foreground">
              <Shield className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl">Liga La Armenia</CardTitle>
          <CardDescription>Sistema de administración</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            {/* Error global de la API */}
            {error && (
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Campo: username */}
            <div className="space-y-1">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="tu_usuario"
                aria-invalid={!!errors.username}
                {...register('username')}
              />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              )}
            </div>

            {/* Campo: password */}
            <div className="space-y-1">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión…
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              El acceso es solo por invitación del administrador.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
