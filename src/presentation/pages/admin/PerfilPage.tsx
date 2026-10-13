import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { KeyRound, Loader2, Save, User as UserIcon } from 'lucide-react'

import { useAuthStore } from '@/presentation/store/auth.store'
import { userAdminUseCase } from '@/infrastructure/factories/user-admin.factory'

import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Badge } from '@/presentation/components/ui/badge'
import { Separator } from '@/presentation/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const perfilSchema = z.object({
  first_name: z.string().max(150).optional(),
  last_name: z.string().max(150).optional(),
  email: z.string().email('Email inválido').or(z.literal('')).optional(),
})

type PerfilForm = z.infer<typeof perfilSchema>

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Requerido'),
    new_password: z.string().min(8, 'Mínimo 8 caracteres'),
    new_password2: z.string().min(8, 'Mínimo 8 caracteres'),
  })
  .refine((d) => d.new_password === d.new_password2, {
    message: 'Las contraseñas no coinciden',
    path: ['new_password2'],
  })

type PasswordForm = z.infer<typeof passwordSchema>

// ─── Página ───────────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const user = useAuthStore((s) => s.user)
  const setTokens = useAuthStore((s) => s.setTokens)
  const tokens = useAuthStore((s) => s.tokens)

  const [isSavingPerfil, setIsSavingPerfil] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [mensajePerfil, setMensajePerfil] = useState<string | null>(null)
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null)
  const [mensajePassword, setMensajePassword] = useState<string | null>(null)
  const [errorPassword, setErrorPassword] = useState<string | null>(null)

  const perfilForm = useForm<PerfilForm>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
    },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password2: '',
    },
  })

  // Cargar perfil al montar
  useEffect(() => {
    if (user) {
      perfilForm.reset({
        first_name: '',
        last_name: '',
        email: user.email || '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function onGuardarPerfil(data: PerfilForm) {
    setIsSavingPerfil(true)
    setMensajePerfil(null)
    setErrorPerfil(null)
    try {
      const updated = await userAdminUseCase.updateProfile({
        first_name: data.first_name || undefined,
        last_name: data.last_name || undefined,
        email: data.email || undefined,
      })
      setMensajePerfil('Perfil actualizado correctamente.')
      if (user && tokens) {
        setTokens(tokens.access, tokens.refresh, {
          ...user,
          email: updated.email,
        })
      }
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      setErrorPerfil(e.detail ?? e.message ?? 'Error al actualizar perfil')
    } finally {
      setIsSavingPerfil(false)
    }
  }

  async function onCambiarPassword(data: PasswordForm) {
    setIsSavingPassword(true)
    setMensajePassword(null)
    setErrorPassword(null)
    try {
      const res = await userAdminUseCase.changePassword(data)
      setMensajePassword(res.message || 'Contraseña actualizada.')
      passwordForm.reset({
        current_password: '',
        new_password: '',
        new_password2: '',
      })
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      setErrorPassword(e.detail ?? e.message ?? 'Error al cambiar contraseña')
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (!user) {
    return (
      <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
        No hay sesión activa.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <UserIcon className="h-6 w-6 text-primary" />
          Mi perfil
        </h1>
        <p className="text-sm text-muted-foreground">
          Administra tus datos personales y tu contraseña.
        </p>
      </div>

      {/* Info del usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cuenta</CardTitle>
          <CardDescription>Datos de tu cuenta actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Username:</span>{' '}
              <span className="font-mono font-medium">{user.username}</span>
            </div>
            <div>
              <span className="text-muted-foreground">User ID:</span>{' '}
              <span className="font-mono">{user.user_id}</span>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            {user.is_superuser && (
              <Badge variant="default">Superadmin</Badge>
            )}
            {user.is_staff && !user.is_superuser && (
              <Badge variant="secondary">Staff</Badge>
            )}
            {user.groups.length > 0 ? (
              user.groups.map((g) => (
                <Badge key={g} variant="outline">
                  {g}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                Sin grupos asignados
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="datos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-80">
          <TabsTrigger value="datos">Datos personales</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
        </TabsList>

        {/* Tab: Datos personales */}
        <TabsContent value="datos">
          <Card>
            <CardHeader>
              <CardTitle>Datos personales</CardTitle>
              <CardDescription>
                Actualiza tu nombre y correo electrónico.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={perfilForm.handleSubmit(onGuardarPerfil)}
                className="space-y-4 max-w-lg"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="first_name">Nombre</Label>
                    <Input
                      id="first_name"
                      {...perfilForm.register('first_name')}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="last_name">Apellido</Label>
                    <Input
                      id="last_name"
                      {...perfilForm.register('last_name')}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...perfilForm.register('email')}
                  />
                  {perfilForm.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {perfilForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {mensajePerfil && (
                  <div className="rounded-md bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                    {mensajePerfil}
                  </div>
                )}

                {errorPerfil && (
                  <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {errorPerfil}
                  </div>
                )}

                <Button type="submit" disabled={isSavingPerfil} className="gap-2">
                  {isSavingPerfil ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Guardar cambios
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Seguridad */}
        <TabsContent value="seguridad">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Cambiar contraseña
              </CardTitle>
              <CardDescription>
                Actualiza tu contraseña. Debes conocer la actual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit(onCambiarPassword)}
                className="space-y-4 max-w-lg"
              >
                <div className="space-y-1">
                  <Label htmlFor="current_password">Contraseña actual *</Label>
                  <Input
                    id="current_password"
                    type="password"
                    autoComplete="current-password"
                    {...passwordForm.register('current_password')}
                  />
                  {passwordForm.formState.errors.current_password && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.current_password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="new_password">Nueva contraseña *</Label>
                  <Input
                    id="new_password"
                    type="password"
                    autoComplete="new-password"
                    {...passwordForm.register('new_password')}
                  />
                  {passwordForm.formState.errors.new_password && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.new_password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="new_password2">
                    Confirmar nueva contraseña *
                  </Label>
                  <Input
                    id="new_password2"
                    type="password"
                    autoComplete="new-password"
                    {...passwordForm.register('new_password2')}
                  />
                  {passwordForm.formState.errors.new_password2 && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.new_password2.message}
                    </p>
                  )}
                </div>

                {mensajePassword && (
                  <div className="rounded-md bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                    {mensajePassword}
                  </div>
                )}

                {errorPassword && (
                  <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {errorPassword}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSavingPassword}
                  className="gap-2"
                >
                  {isSavingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}
                  Cambiar contraseña
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
