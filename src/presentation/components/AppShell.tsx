import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Shield,
  Calendar,
  Users,
  UserCog,
  Trophy,
  ListChecks,
  FileText,
  DollarSign,
  Heart,
  Newspaper,
  LogOut,
  User as UserIcon,
  ClipboardList,
  Flag,
  UserPlus,
  Menu,
  Receipt,
  BarChart3,
  Home,
} from 'lucide-react'
import { useAuthStore } from '@/presentation/store/auth.store'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import { Separator } from '@/presentation/components/ui/separator'
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/presentation/components/ui/sheet'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase()
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  groups?: string[]
  superuserOnly?: boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
}

// ─── Navegación del panel lateral (agrupada por comisión) ─────────────────────

const SIDEBAR_GROUPS: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      {
        to: '/admin/equipos',
        label: 'Equipos',
        icon: <Shield className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Comisión Técnica',
    items: [
      {
        to: '/admin/temporadas',
        label: 'Temporadas',
        icon: <Calendar className="h-4 w-4" />,
        groups: ['Comision Tecnica'],
      },
      {
        to: '/admin/categorias',
        label: 'Categorías',
        icon: <Flag className="h-4 w-4" />,
        groups: ['Comision Tecnica'],
      },
      {
        to: '/admin/inscripciones',
        label: 'Inscripciones',
        icon: <UserPlus className="h-4 w-4" />,
        groups: ['Comision Tecnica'],
      },
      {
        to: '/admin/jornadas',
        label: 'Jornadas',
        icon: <Calendar className="h-4 w-4" />,
        groups: ['Comision Tecnica'],
      },
      {
        to: '/admin/partidos',
        label: 'Partidos',
        icon: <Trophy className="h-4 w-4" />,
        groups: ['Comision Tecnica'],
      },
      {
        to: '/admin/vocalias',
        label: 'Vocalías',
        icon: <ClipboardList className="h-4 w-4" />,
        groups: ['Comision Tecnica'],
      },
    ],
  },
  {
    title: 'Comisión Calificaciones',
    items: [
      {
        to: '/admin/jugadores',
        label: 'Jugadores',
        icon: <Users className="h-4 w-4" />,
        groups: ['Comision Calificaciones'],
      },
      {
        to: '/admin/plantillas',
        label: 'Plantillas',
        icon: <Users className="h-4 w-4" />,
        groups: ['Comision Calificaciones'],
      },
      {
        to: '/admin/capitanes',
        label: 'Capitanes',
        icon: <Trophy className="h-4 w-4" />,
        groups: ['Comision Calificaciones'],
      },
    ],
  },
  {
    title: 'Comisión Penas',
    items: [
      {
        to: '/admin/sanciones',
        label: 'Sanciones',
        icon: <Flag className="h-4 w-4" />,
        groups: ['Comision Penas'],
      },
      {
        to: '/admin/multas',
        label: 'Multas',
        icon: <DollarSign className="h-4 w-4" />,
        groups: ['Comision Penas'],
      },
      {
        to: '/admin/recibos',
        label: 'Recibos',
        icon: <Receipt className="h-4 w-4" />,
        groups: ['Comision Penas'],
      },
    ],
  },
  {
    title: 'Comisión Financiera',
    items: [
      {
        to: '/admin/finanzas',
        label: 'Finanzas',
        icon: <DollarSign className="h-4 w-4" />,
        groups: ['Comision Financiera'],
      },
      {
        to: '/admin/informes-semanales',
        label: 'Informes semanales',
        icon: <BarChart3 className="h-4 w-4" />,
        groups: ['Comision Financiera'],
      },
    ],
  },
  {
    title: 'Comisión Seguro',
    items: [
      {
        to: '/admin/lesiones',
        label: 'Lesiones',
        icon: <Heart className="h-4 w-4" />,
        groups: ['Comision Seguro'],
      },
    ],
  },
  {
    title: 'Comisión Administrativa',
    items: [
      {
        to: '/admin/sesiones',
        label: 'Sesiones',
        icon: <ListChecks className="h-4 w-4" />,
        groups: ['Comision Administrativa'],
      },
      {
        to: '/admin/documentos',
        label: 'Documentos',
        icon: <FileText className="h-4 w-4" />,
        groups: ['Comision Administrativa'],
      },
      {
        to: '/admin/noticias',
        label: 'Noticias',
        icon: <Newspaper className="h-4 w-4" />,
        groups: ['Comision Administrativa'],
      },
    ],
  },
  {
    title: 'Admin',
    items: [
      {
        to: '/admin/usuarios',
        label: 'Usuarios',
        icon: <UserCog className="h-4 w-4" />,
        superuserOnly: true,
      },
    ],
  },
]

// ─── Utilidad de filtrado ─────────────────────────────────────────────────────

function hasAccess(
  item: NavItem,
  user: ReturnType<typeof useAuthStore.getState>['user'],
): boolean {
  if (!user) return false
  if (user.is_superuser) return true
  if (item.superuserOnly) return false
  if (!item.groups) return true
  return item.groups.some((g) => user.groups.includes(g))
}

// ─── Componente: item del sidebar ─────────────────────────────────────────────

function SidebarLink({
  item,
  onNavigate,
}: {
  item: NavItem
  onNavigate: () => void
}) {
  const location = useLocation()
  const isActive = location.pathname === item.to

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      className={[
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      ].join(' ')}
    >
      {item.icon}
      <span>{item.label}</span>
    </Link>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AppShell() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  function closeSidebar() {
    setSidebarOpen(false)
  }

  const visibleGroups = SIDEBAR_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => hasAccess(item, user)),
  })).filter((group) => group.items.length > 0)

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          {/* Botón hamburguesa */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menú"
                className="h-9 w-9"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="border-b px-4 py-4">
                <SheetTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Liga La Armenia
                </SheetTitle>
              </SheetHeader>

              <div
                className="flex flex-col gap-2 overflow-y-auto p-4"
                style={{ maxHeight: 'calc(100vh - 80px)' }}
              >
                {/* Botón destacado: Ir al Dashboard */}
                <Link
                  to="/admin"
                  onClick={closeSidebar}
                  className="flex items-center gap-3 rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Home className="h-4 w-4" />
                  <span>Ir al Dashboard</span>
                </Link>

                <Separator className="my-2" />

                {/* Grupos por comisión */}
                {visibleGroups.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {group.title}
                    </p>
                    {group.items.map((item) => (
                      <SidebarLink
                        key={item.to}
                        item={item}
                        onNavigate={closeSidebar}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo (marca, no clickeable) */}
          <Link to="/admin" className="flex items-center gap-2 font-bold">
            <Shield className="h-5 w-5 text-primary" />
            <span>Liga La Armenia</span>
          </Link>

          <div className="flex-1" />

          {/* Avatar / menú de usuario */}
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                    aria-label="Menú de usuario"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-sm">
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                      {user.groups.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {user.groups.map((g) => (
                            <Badge
                              key={g}
                              variant="secondary"
                              className="text-xs"
                            >
                              {g}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {user.is_superuser && (
                        <Badge variant="default" className="w-fit text-xs">
                          Superadmin
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link
                      to="/admin/perfil"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="h-4 w-4" />
                      Mi perfil
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link to="/login">Iniciar sesión</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Contenido principal ─────────────────────────────────────────── */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        Liga Barrial La Armenia &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
