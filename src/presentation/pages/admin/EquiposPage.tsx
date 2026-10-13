import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { KeyRound, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'

import { useEquipoStore } from '@/presentation/store/equipo.store'
import { useAuthStore } from '@/presentation/store/auth.store'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Badge } from '@/presentation/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import DataTable, { type Column } from '@/presentation/components/shared/DataTable'
import Pagination from '@/presentation/components/shared/Pagination'
import ConfirmDialog from '@/presentation/components/shared/ConfirmDialog'
import type { Equipo } from '@/domain/entities/equipo.entity'

// ─── Schema: crear equipo (con username + password) ──────────────────────────

const createEquipoSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(150),
  siglas: z.string().max(10).optional(),
  presidente: z.string().max(150).optional(),
  telefono: z.string().max(30).optional(),
  email: z.string().email('Email inválido').or(z.literal('')).optional(),
  color_principal: z.string().max(30).optional(),
  color_secundario: z.string().max(30).optional(),
  activo: z.boolean(),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(150)
    .regex(/^[\w.@+-]+$/, 'Solo letras, números y @ . + - _'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type CreateEquipoForm = z.infer<typeof createEquipoSchema>

// ─── Schema: editar equipo (sin tocar usuario) ───────────────────────────────

const updateEquipoSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(150),
  siglas: z.string().max(10).optional(),
  presidente: z.string().max(150).optional(),
  telefono: z.string().max(30).optional(),
  email: z.string().email('Email inválido').or(z.literal('')).optional(),
  color_principal: z.string().max(30).optional(),
  color_secundario: z.string().max(30).optional(),
  activo: z.boolean(),
})

type UpdateEquipoForm = z.infer<typeof updateEquipoSchema>

// ─── Schema: reset password ──────────────────────────────────────────────────

const resetPasswordSchema = z
  .object({
    new_password: z.string().min(8, 'Mínimo 8 caracteres'),
    new_password2: z.string().min(8, 'Mínimo 8 caracteres'),
  })
  .refine((data) => data.new_password === data.new_password2, {
    message: 'Las contraseñas no coinciden',
    path: ['new_password2'],
  })

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

// ─── Página ───────────────────────────────────────────────────────────────────

export default function EquiposPage() {
  const user = useAuthStore((s) => s.user)
  const canWrite = !!user && (user.is_superuser || user.is_staff)
  const canResetPassword = !!user && (user.is_superuser || user.groups.includes('Superadmin'))

  const {
    items,
    total,
    page,
    pageSize,
    search,
    filterActivo,
    isLoading,
    isSaving,
    error,
    load,
    setPage,
    setSearch,
    setFilterActivo,
    create,
    update,
    remove,
    resetPassword,
    clearError,
  } = useEquipoStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Equipo | null>(null)
  const [deleting, setDeleting] = useState<Equipo | null>(null)
  const [resetting, setResetting] = useState<Equipo | null>(null)

  // Formulario para crear
  const createForm = useForm<CreateEquipoForm>({
    resolver: zodResolver(createEquipoSchema),
    defaultValues: {
      nombre: '',
      siglas: '',
      presidente: '',
      telefono: '',
      email: '',
      color_principal: '',
      color_secundario: '',
      activo: true,
      username: '',
      password: '',
    },
  })

  // Formulario para editar
  const updateForm = useForm<UpdateEquipoForm>({
    resolver: zodResolver(updateEquipoSchema),
  })

  // Formulario para reset password
  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { new_password: '', new_password2: '' },
  })

  useEffect(() => {
    load()
  }, [load])

  // ─── Acciones ────────────────────────────────────────────────────────────────

  function openCreate() {
    setEditing(null)
    createForm.reset({
      nombre: '',
      siglas: '',
      presidente: '',
      telefono: '',
      email: '',
      color_principal: '',
      color_secundario: '',
      activo: true,
      username: '',
      password: '',
    })
    clearError()
    setDialogOpen(true)
  }

  function openEdit(eq: Equipo) {
    setEditing(eq)
    updateForm.reset({
      nombre: eq.nombre,
      siglas: eq.siglas ?? '',
      presidente: eq.presidente ?? '',
      telefono: eq.telefono ?? '',
      email: eq.email ?? '',
      color_principal: eq.color_principal ?? '',
      color_secundario: eq.color_secundario ?? '',
      activo: eq.activo,
    })
    clearError()
    setDialogOpen(true)
  }

  async function onCreate(data: CreateEquipoForm) {
    try {
      await create({
        nombre: data.nombre,
        siglas: data.siglas || undefined,
        presidente: data.presidente || undefined,
        telefono: data.telefono || undefined,
        email: data.email || undefined,
        color_principal: data.color_principal || undefined,
        color_secundario: data.color_secundario || undefined,
        activo: data.activo,
        username: data.username,
        password: data.password,
      })
      setDialogOpen(false)
    } catch {
      // El error ya está en el store
    }
  }

  async function onUpdate(data: UpdateEquipoForm) {
    if (!editing) return
    try {
      await update(editing.id, {
        nombre: data.nombre,
        siglas: data.siglas || undefined,
        presidente: data.presidente || undefined,
        telefono: data.telefono || undefined,
        email: data.email || undefined,
        color_principal: data.color_principal || undefined,
        color_secundario: data.color_secundario || undefined,
        activo: data.activo,
      })
      setDialogOpen(false)
    } catch {
      // El error ya está en el store
    }
  }

  async function onDelete() {
    if (!deleting) return
    try {
      await remove(deleting.id)
      setDeleting(null)
    } catch {
      // El error ya está en el store
    }
  }

  function openReset(eq: Equipo) {
    setResetting(eq)
    resetForm.reset({ new_password: '', new_password2: '' })
    clearError()
  }

  async function onReset(data: ResetPasswordForm) {
    if (!resetting) return
    try {
      await resetPassword(resetting.id, data.new_password)
      setResetting(null)
    } catch {
      // El error ya está en el store
    }
  }

  // ─── Columnas ────────────────────────────────────────────────────────────────

  const columns: Column<Equipo>[] = [
    {
      key: 'nombre',
      header: 'Equipo',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.nombre}</span>
          {row.siglas && (
            <span className="text-xs text-muted-foreground">{row.siglas}</span>
          )}
        </div>
      ),
    },
    {
      key: 'presidente',
      header: 'Presidente',
      cell: (row) => (
        <span className="text-sm">{row.presidente || '—'}</span>
      ),
    },
    {
      key: 'username',
      header: 'Usuario',
      cell: (row) => (
        <span className="font-mono text-sm">{row.username}</span>
      ),
    },
    {
      key: 'activo',
      header: 'Estado',
      cell: (row) => (
        <Badge variant={row.activo ? 'default' : 'secondary'}>
          {row.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'acciones',
      header: <span className="text-right">Acciones</span>,
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => openEdit(row)}
            disabled={!canWrite}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => openReset(row)}
            disabled={!canResetPassword}
            title="Resetear contraseña"
          >
            <KeyRound className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setDeleting(row)}
            disabled={!canWrite}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipos</h1>
          <p className="text-sm text-muted-foreground">
            Equipos de la liga. Al crear un equipo se genera su usuario de acceso.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo equipo
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          placeholder="Buscar por nombre, presidente o usuario…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-sm"
        />
        <Select
          value={filterActivo === undefined ? 'all' : String(filterActivo)}
          onValueChange={(v) => {
            if (v === 'all') setFilterActivo(undefined)
            else setFilterActivo(v === 'true')
          }}
        >
          <SelectTrigger className="md:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Activos</SelectItem>
            <SelectItem value="false">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Tabla */}
      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No hay equipos registrados."
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        disabled={isLoading}
      />

      {/* Dialog crear / editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar equipo' : 'Nuevo equipo'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Actualiza los datos del equipo. El usuario asociado no se modifica aquí.'
                : 'Al crear el equipo se generará también su usuario de acceso (username y password).'}
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            /* ─── Editar ─── */
            <form
              onSubmit={updateForm.handleSubmit(onUpdate)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input id="nombre" {...updateForm.register('nombre')} />
                  {updateForm.formState.errors.nombre && (
                    <p className="text-xs text-destructive">
                      {updateForm.formState.errors.nombre.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="siglas">Siglas</Label>
                  <Input id="siglas" {...updateForm.register('siglas')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="presidente">Presidente</Label>
                  <Input id="presidente" {...updateForm.register('presidente')} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" {...updateForm.register('telefono')} />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...updateForm.register('email')} />
                {updateForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {updateForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="color_principal">Color principal</Label>
                  <Input
                    id="color_principal"
                    placeholder="#22c55e"
                    {...updateForm.register('color_principal')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="color_secundario">Color secundario</Label>
                  <Input
                    id="color_secundario"
                    placeholder="#ffffff"
                    {...updateForm.register('color_secundario')}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activo"
                  className="h-4 w-4"
                  {...updateForm.register('activo')}
                />
                <Label htmlFor="activo" className="cursor-pointer">
                  Equipo activo
                </Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar cambios
                </Button>
              </DialogFooter>
            </form>
          ) : (
            /* ─── Crear ─── */
            <form
              onSubmit={createForm.handleSubmit(onCreate)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Atlético Armenia"
                    {...createForm.register('nombre')}
                  />
                  {createForm.formState.errors.nombre && (
                    <p className="text-xs text-destructive">
                      {createForm.formState.errors.nombre.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="siglas">Siglas</Label>
                  <Input
                    id="siglas"
                    placeholder="AAR"
                    {...createForm.register('siglas')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="presidente">Presidente</Label>
                  <Input
                    id="presidente"
                    {...createForm.register('presidente')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    {...createForm.register('telefono')}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...createForm.register('email')}
                />
                {createForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {createForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="color_principal">Color principal</Label>
                  <Input
                    id="color_principal"
                    placeholder="#22c55e"
                    {...createForm.register('color_principal')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="color_secundario">Color secundario</Label>
                  <Input
                    id="color_secundario"
                    placeholder="#ffffff"
                    {...createForm.register('color_secundario')}
                  />
                </div>
              </div>

              <div className="rounded-md border bg-muted/40 p-3 space-y-3">
                <p className="text-sm font-medium">Credenciales de acceso</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      placeholder="atletico_armenia"
                      {...createForm.register('username')}
                    />
                    {createForm.formState.errors.username && (
                      <p className="text-xs text-destructive">
                        {createForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      type="text"
                      placeholder="Mínimo 8 caracteres"
                      {...createForm.register('password')}
                    />
                    {createForm.formState.errors.password && (
                      <p className="text-xs text-destructive">
                        {createForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anota estas credenciales y entrégalas al presidente del equipo.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activo-create"
                  className="h-4 w-4"
                  {...createForm.register('activo')}
                />
                <Label htmlFor="activo-create" className="cursor-pointer">
                  Equipo activo
                </Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear equipo
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog reset password */}
      <Dialog
        open={!!resetting}
        onOpenChange={(open) => !open && setResetting(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resetear contraseña</DialogTitle>
            <DialogDescription>
              {resetting
                ? `Nueva contraseña para el usuario "${resetting.username}" del equipo "${resetting.nombre}".`
                : ''}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={resetForm.handleSubmit(onReset)}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="new_password">Nueva contraseña</Label>
              <Input
                id="new_password"
                type="text"
                {...resetForm.register('new_password')}
              />
              {resetForm.formState.errors.new_password && (
                <p className="text-xs text-destructive">
                  {resetForm.formState.errors.new_password.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="new_password2">Confirmar contraseña</Label>
              <Input
                id="new_password2"
                type="text"
                {...resetForm.register('new_password2')}
              />
              {resetForm.formState.errors.new_password2 && (
                <p className="text-xs text-destructive">
                  {resetForm.formState.errors.new_password2.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setResetting(null)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cambiar contraseña
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm eliminar */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar equipo"
        description={
          deleting
            ? `¿Seguro que quieres eliminar "${deleting.nombre}"? El usuario asociado también será eliminado.`
            : ''
        }
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={onDelete}
        isLoading={isSaving}
      />
    </div>
  )
}
