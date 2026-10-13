import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  DollarSign,
  Flag,
  Newspaper,
  TrendingUp,
  Users,
  Activity,
  Shield,
  ClipboardList,
  Heart,
  FileText,
  ListChecks,
  UserCog,
  UserPlus,
  LayoutGrid,
  Trophy,
  Receipt,
  BarChart3,
} from 'lucide-react'

import { useAuthStore } from '@/presentation/store/auth.store'
import { useDashboardStore } from '@/presentation/store/dashboard.store'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import {
  formatDate,
  formatMoney,
  formatTime,
} from '@/presentation/utils/formatters'

// ─── Utilidad: fecha actual en español ────────────────────────────────────────

function formatHoy(): string {
  const hoy = new Date()
  const formatted = new Intl.DateTimeFormat('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(hoy)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

// ─── Accesos rápidos ──────────────────────────────────────────────────────────

interface QuickLink {
  to: string
  label: string
  icon: React.ReactNode
  groups?: string[]
  superuserOnly?: boolean
}

const QUICK_LINKS: QuickLink[] = [
  {
    to: '/admin/temporadas',
    label: 'Temporadas',
    icon: <Calendar className="h-5 w-5" />,
    groups: ['Comision Tecnica'],
  },
  {
    to: '/admin/categorias',
    label: 'Categorías',
    icon: <Flag className="h-5 w-5" />,
    groups: ['Comision Tecnica'],
  },
  {
    to: '/admin/equipos',
    label: 'Equipos',
    icon: <Shield className="h-5 w-5" />,
  },
  {
    to: '/admin/inscripciones',
    label: 'Inscripciones',
    icon: <UserPlus className="h-5 w-5" />,
    groups: ['Comision Tecnica'],
  },
  {
    to: '/admin/jugadores',
    label: 'Jugadores',
    icon: <Users className="h-5 w-5" />,
    groups: ['Comision Calificaciones'],
  },
  {
    to: '/admin/plantillas',
    label: 'Plantillas',
    icon: <Users className="h-5 w-5" />,
    groups: ['Comision Calificaciones'],
  },
  {
    to: '/admin/capitanes',
    label: 'Capitanes',
    icon: <Users className="h-5 w-5" />,
    groups: ['Comision Calificaciones'],
  },
  {
    to: '/admin/jornadas',
    label: 'Jornadas',
    icon: <Calendar className="h-5 w-5" />,
    groups: ['Comision Tecnica'],
  },
  {
    to: '/admin/partidos',                              
    label: 'Partidos',                                  
    icon: <Trophy className="h-5 w-5" />,              
    groups: ['Comision Tecnica'],                       
  },
  {
    to: '/admin/vocalias',
    label: 'Vocalías',
    icon: <ClipboardList className="h-5 w-5" />,
    groups: ['Comision Tecnica'],
  },
  {
    to: '/admin/sanciones',
    label: 'Sanciones',
    icon: <Flag className="h-5 w-5" />,
    groups: ['Comision Penas'],
  },
  {
    to: '/admin/multas',                             
    label: 'Multas',                                 
    icon: <DollarSign className="h-5 w-5" />,        
    groups: ['Comision Penas'],                      
  },                                                 
  {
    to: '/admin/recibos',                            
    label: 'Recibos',                                
    icon: <Receipt className="h-5 w-5" />,           
    groups: ['Comision Penas'],                      
  },  
  {
    to: '/admin/finanzas',
    label: 'Finanzas',
    icon: <DollarSign className="h-5 w-5" />,
    groups: ['Comision Financiera'],
  },
    {
    to: '/admin/informes-semanales',                      
    label: 'Informes',                                    
    icon: <BarChart3 className="h-5 w-5" />,              
    groups: ['Comision Financiera'],                      
  },                                                      
  {
    to: '/admin/lesiones',
    label: 'Lesiones',
    icon: <Heart className="h-5 w-5" />,
    groups: ['Comision Seguro'],
  },
  {
    to: '/admin/sesiones',
    label: 'Sesiones',
    icon: <ListChecks className="h-5 w-5" />,
    groups: ['Comision Administrativa'],
  },
  {
    to: '/admin/documentos',
    label: 'Documentos',
    icon: <FileText className="h-5 w-5" />,
    groups: ['Comision Administrativa'],
  },
  {
    to: '/admin/noticias',
    label: 'Noticias',
    icon: <Newspaper className="h-5 w-5" />,
    groups: ['Comision Administrativa'],
  },
  {
    to: '/admin/usuarios',
    label: 'Usuarios',
    icon: <UserCog className="h-5 w-5" />,
    superuserOnly: true,
  },
]

function AccesosRapidos() {
  const user = useAuthStore((s) => s.user)
  if (!user) return null

  const visibles = QUICK_LINKS.filter((link) => {
    if (user.is_superuser) return true
    if (link.superuserOnly) return false
    if (!link.groups) return true
    return link.groups.some((g) => user.groups.includes(g))
  })

  if (visibles.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Accesos rápidos</CardTitle>
          <CardDescription>Ir directo a un módulo</CardDescription>
        </div>
        <LayoutGrid className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {visibles.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex flex-col items-center gap-2 rounded-md border p-3 text-center text-sm transition-colors hover:border-primary hover:bg-accent"
            >
              <div className="text-primary">{link.icon}</div>
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Widget: próximos partidos ────────────────────────────────────────────────

function ProximosPartidos() {
  const data = useDashboardStore((s) => s.data)
  const partidos = data?.proximosPartidos ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Próximos partidos</CardTitle>
          <CardDescription>Sábados y domingos</CardDescription>
        </div>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {partidos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin partidos programados.</p>
        ) : (
          <ul className="space-y-3">
            {partidos.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium">
                    {p.equipo_local.nombre} vs {p.equipo_visitante.nombre}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {p.dia_display} · {p.hora ? formatTime(p.hora) : 'sin hora'} ·{' '}
                    {p.categoria_nombre}
                  </span>
                </div>
                <Badge variant="outline">J{p.jornada_numero}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Widget: resultados recientes ─────────────────────────────────────────────

function ResultadosRecientes() {
  const data = useDashboardStore((s) => s.data)
  const partidos = data?.resultadosRecientes ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Resultados recientes</CardTitle>
          <CardDescription>Últimos partidos finalizados</CardDescription>
        </div>
        <Activity className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {partidos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin resultados aún.</p>
        ) : (
          <ul className="space-y-3">
            {partidos.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex-1">
                  <div className="font-medium">
                    {p.equipo_local.nombre}
                    <span className="mx-2 font-mono">
                      {p.goles_local} - {p.goles_visitante}
                    </span>
                    {p.equipo_visitante.nombre}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    J{p.jornada_numero} · {p.categoria_nombre}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Widget: tabla de posiciones ──────────────────────────────────────────────

function TopPosiciones() {
  const data = useDashboardStore((s) => s.data)
  const tabla = data?.topPosiciones ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Tabla de posiciones</CardTitle>
          <CardDescription>Top 5</CardDescription>
        </div>
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {tabla.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay partidos finalizados.
          </p>
        ) : (
          <ul className="space-y-2">
            {tabla.map((row) => (
              <li key={row.equipo_id} className="flex items-center gap-2 text-sm">
                <span className="w-5 font-bold">{row.posicion}</span>
                <span className="flex-1 truncate">{row.equipo}</span>
                <span className="font-mono text-xs">{row.pts} pts</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Widget: goleadores ───────────────────────────────────────────────────────

function TopGoleadores() {
  const data = useDashboardStore((s) => s.data)
  const goleadores = data?.topGoleadores ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Goleadores</CardTitle>
          <CardDescription>Top 5</CardDescription>
        </div>
        <Flag className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {goleadores.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin goles registrados.</p>
        ) : (
          <ul className="space-y-2">
            {goleadores.map((g, i) => (
              <li key={g.jugador_id} className="flex items-center gap-2 text-sm">
                <span className="w-5 font-bold">{i + 1}</span>
                <div className="flex-1 truncate">
                  <div className="font-medium">{g.jugador}</div>
                  <div className="text-xs text-muted-foreground">{g.equipo}</div>
                </div>
                <span className="font-mono text-xs">{g.goles}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Widget: últimas noticias ─────────────────────────────────────────────────

function UltimasNoticias() {
  const data = useDashboardStore((s) => s.data)
  const noticias = data?.ultimasNoticias ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Últimas noticias</CardTitle>
          <CardDescription>Publicadas</CardDescription>
        </div>
        <Newspaper className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {noticias.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin noticias publicadas.</p>
        ) : (
          <ul className="space-y-3">
            {noticias.map((n) => (
              <li key={n.id} className="text-sm">
                <div className="font-medium line-clamp-1">{n.titulo}</div>
                <div className="text-xs text-muted-foreground">
                  {n.fecha_publicacion
                    ? formatDate(n.fecha_publicacion)
                    : 'Borrador'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Widget: usuarios stats ───────────────────────────────────────────────────

function UsuariosStats() {
  const stats = useDashboardStore((s) => s.data?.usuariosStats)
  if (!stats) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Usuarios</CardTitle>
          <CardDescription>Resumen del sistema</CardDescription>
        </div>
        <Users className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs text-muted-foreground">Activos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <div className="text-xs text-muted-foreground">Inactivos</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.staff}</div>
            <div className="text-xs text-muted-foreground">Staff</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Widget: finanzas resumen ─────────────────────────────────────────────────

function FinanzasResumen() {
  const resumen = useDashboardStore((s) => s.data?.finanzasResumen)
  if (!resumen) return null

  const ingresos = Number(resumen.total_ingresos)
  const egresos = Number(resumen.total_egresos)
  const balance = Number(resumen.balance)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Finanzas</CardTitle>
          <CardDescription>Balance general</CardDescription>
        </div>
        <DollarSign className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ingresos</span>
            <span className="font-medium text-green-600">
              {formatMoney(ingresos)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Egresos</span>
            <span className="font-medium text-red-600">
              {formatMoney(egresos)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2 text-sm font-bold">
            <span>Balance</span>
            <span className={balance >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatMoney(balance)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {resumen.cantidad_movimientos} movimientos registrados
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, error, load } = useDashboardStore()

  const incluirAdmin = !!user && (user.is_superuser || user.is_staff)

  useEffect(() => {
    load(null, incluirAdmin)
  }, [load, incluirAdmin])

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Bienvenido, {user?.username}
            {user?.is_superuser && ' · Superadmin'}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{formatHoy()}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Accesos rápidos */}
      <AccesosRapidos />

      {/* Grid de widgets */}
      {isLoading && !data ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ProximosPartidos />
          <ResultadosRecientes />
          <UltimasNoticias />
          <TopPosiciones />
          <TopGoleadores />
          {incluirAdmin && <UsuariosStats />}
          {incluirAdmin && <FinanzasResumen />}
        </div>
      )}
    </div>
  )
}
