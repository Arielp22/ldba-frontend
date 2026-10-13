import { useEffect, useState } from 'react'
import {
  Shield,
  UserCheck,
  UserCog,
  UserX,
  Users,
} from 'lucide-react'

import { useUserAdminStore } from '@/presentation/store/user-admin.store'
import { useAuthStore } from '@/presentation/store/auth.store'

import { Input } from '@/presentation/components/ui/input'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import DataTable, { type Column } from '@/presentation/components/shared/DataTable'
import Pagination from '@/presentation/components/shared/Pagination'
import type { UserAdmin } from '@/domain/entities/user-admin.entity'
import { formatDate } from '@/presentation/utils/formatters'

// ─── Widgets de stats ─────────────────────────────────────────────────────────

function StatsWidgets() {
  const stats = useUserAdminStore((s) => s.stats)

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Usuarios registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activos</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.active}
          </div>
          <p className="text-xs text-muted-foreground">Con acceso al sistema</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
          <UserX className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          <p className="text-xs text-muted-foreground">Sin acceso</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Staff</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.staff}</div>
          <p className="text-xs text-muted-foreground">Con permisos admin</p>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function UsuariosPage() {
  const currentUser = useAuthStore((s) => s.user)

  const {
    items,
    total,
    page,
    pageSize,
    search,
    filterStaff,
    filterActive,
    isLoading,
    isSaving,
    error,
    load,
    loadStats,
    setPage,
    setSearch,
    setFilterStaff,
    setFilterActive,
    toggleActive,
    clearError,
  } = useUserAdminStore()

  const [toggling, setToggling] = useState<number | null>(null)

  useEffect(() => {
    load()
    loadStats()
    clearError()
  }, [load, loadStats, clearError])

  async function onToggleActive(user: UserAdmin) {
    if (user.id === currentUser?.user_id) {
      // No permitir auto-desactivarse
      return
    }
    setToggling(user.id)
    try {
      await toggleActive(user.id)
    } catch {
      // Error ya en el store
    } finally {
      setToggling(null)
    }
  }

  // ─── Columnas ────────────────────────────────────────────────────────────────

  const columns: Column<UserAdmin>[] = [
    {
      key: 'username',
      header: 'Usuario',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <UserCog className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-medium">{row.username}</span>
            <span className="text-xs text-muted-foreground">
              {row.email || '—'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'nombre',
      header: 'Nombre',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.first_name || row.last_name
            ? `${row.first_name} ${row.last_name}`.trim()
            : '—'}
        </span>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.is_staff && (
            <Badge variant="default" className="text-xs">
              Staff
            </Badge>
          )}
          {!row.is_staff && (
            <Badge variant="outline" className="text-xs">
              Usuario
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'fecha',
      header: 'Registrado',
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.date_joined)}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => (
        <Badge variant={row.is_active ? 'default' : 'secondary'}>
          {row.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'acciones',
      header: <span className="text-right">Acciones</span>,
      className: 'text-right',
      cell: (row) => {
        const isSelf = row.id === currentUser?.user_id
        return (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant={row.is_active ? 'outline' : 'default'}
              onClick={() => onToggleActive(row)}
              disabled={isSelf || isSaving || toggling === row.id}
              title={
                isSelf
                  ? 'No puedes desactivar tu propia cuenta'
                  : row.is_active
                    ? 'Desactivar'
                    : 'Activar'
              }
            >
              {row.is_active ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        )
      },
    },
  ]

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de usuarios del sistema. Solo visible para Superadmin.
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsWidgets />

      {/* Filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
        <Input
          placeholder="Buscar por username, email o nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-sm"
        />
        <Select
          value={filterStaff === undefined ? 'all' : String(filterStaff)}
          onValueChange={(v) => {
            if (v === 'all') setFilterStaff(undefined)
            else setFilterStaff(v === 'true')
          }}
        >
          <SelectTrigger className="md:w-44">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="true">Solo Staff</SelectItem>
            <SelectItem value="false">Solo Usuarios</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filterActive === undefined ? 'all' : String(filterActive)}
          onValueChange={(v) => {
            if (v === 'all') setFilterActive(undefined)
            else setFilterActive(v === 'true')
          }}
        >
          <SelectTrigger className="md:w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Activos</SelectItem>
            <SelectItem value="false">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No hay usuarios registrados."
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        disabled={isLoading}
      />

      {/* Nota informativa */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Nota</CardTitle>
          <CardDescription>
            Los usuarios se crean automáticamente al crear equipos (Módulo 6).
            La contraseña de cada usuario se puede resetear desde la página de
            Equipos (botón llave).
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
