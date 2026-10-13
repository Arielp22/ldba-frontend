import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { Shield, LogIn } from 'lucide-react'
import { useAuthStore } from '@/presentation/store/auth.store'
import { Button } from '@/presentation/components/ui/button'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'text-sm font-medium transition-colors hover:text-primary',
    isActive ? 'text-primary' : 'text-muted-foreground',
  ].join(' ')
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PublicLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  function goToAdmin() {
    navigate('/admin')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Header público ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold">
            <Shield className="h-5 w-5 text-primary" />
            <span>Liga La Armenia</span>
          </Link>

          <div className="flex-1" />

          {/* Navegación pública */}
          <nav className="hidden items-center gap-5 md:flex">
            <NavLink to="/" end className={navLinkClass}>
              Inicio
            </NavLink>
            <NavLink to="/tabla" className={navLinkClass}>
              Tabla
            </NavLink>
            <NavLink to="/goleadores" className={navLinkClass}>
              Goleadores
            </NavLink>
            <NavLink to="/tarjetas" className={navLinkClass}>
              Tarjetas
            </NavLink>
            <NavLink to="/calendario" className={navLinkClass}>
              Calendario
            </NavLink>
            <NavLink to="/noticias" className={navLinkClass}>
              Noticias
            </NavLink>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {user ? (
              <Button size="sm" onClick={goToAdmin}>
                Ir al panel
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link to="/login" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Navegación móvil */}
        <div className="flex border-t md:hidden">
          <nav className="mx-auto flex w-full max-w-7xl items-center gap-4 overflow-x-auto px-4 py-2">
            <NavLink to="/" end className={navLinkClass}>
              Inicio
            </NavLink>
            <NavLink to="/tabla" className={navLinkClass}>
              Tabla
            </NavLink>
            <NavLink to="/goleadores" className={navLinkClass}>
              Goleadores
            </NavLink>
            <NavLink to="/tarjetas" className={navLinkClass}>
              Tarjetas
            </NavLink>
            <NavLink to="/calendario" className={navLinkClass}>
              Calendario
            </NavLink>
            <NavLink to="/noticias" className={navLinkClass}>
              Noticias
            </NavLink>
          </nav>
        </div>
      </header>

      {/* ── Contenido ───────────────────────────────────────────────────── */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          Liga Barrial La Armenia &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
