import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { useAuthStore } from '@/presentation/store/auth.store'
import ProtectedRoute from './ProtectedRoute'
import PublicLayout from '@/presentation/components/PublicLayout'
import AppShell from '@/presentation/components/AppShell'

// ─── Lazy imports ─────────────────────────────────────────────────────────────

// Auth
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))

// Público
const PublicHomePage = lazy(() => import('../pages/public/PublicHomePage'))
const TablaPosicionesPage = lazy(() => import('../pages/public/TablaPosicionesPage'))
const GoleadoresPage = lazy(() => import('../pages/public/GoleadoresPage'))
const TarjetasPage = lazy(() => import('../pages/public/TarjetasPage'))
const CalendarioPage = lazy(() => import('../pages/public/CalendarioPage'))
const NoticiasPage = lazy(() => import('../pages/public/NoticiasPage'))
const NoticiaDetallePage = lazy(() => import('../pages/public/NoticiaDetallePage'))

// Admin
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage'))
const TemporadasPage = lazy(() => import('../pages/admin/TemporadasPage'))
const CategoriasPage = lazy(() => import('../pages/admin/CategoriasPage'))
const EquiposPage = lazy(() => import('../pages/admin/EquiposPage'))
const InscripcionesPage = lazy(() => import('../pages/admin/InscripcionesPage'))
const JugadoresPage = lazy(() => import('../pages/admin/JugadoresPage'))
const PlantillasPage = lazy(() => import('../pages/admin/PlantillasPage'))
const CapitanesPage = lazy(() => import('../pages/admin/CapitanesPage'))
const JornadasPage = lazy(() => import('../pages/admin/JornadasPage'))
const JornadaDetallePage = lazy(() => import('../pages/admin/JornadaDetallePage'))
const PartidosPage = lazy(() => import('../pages/admin/PartidosPage'))
const VocaliasPage = lazy(() => import('../pages/admin/VocaliasPage'))
const VocaliaDetallePage = lazy(() => import('../pages/admin/VocaliaDetallePage'))
const SancionesPage = lazy(() => import('../pages/admin/SancionesPage'))
const MultasPage = lazy(() => import('../pages/admin/MultasPage'))
const RecibosPage = lazy(() => import('../pages/admin/RecibosPage'))
const MovimientosFinancierosPage = lazy(
  () => import('../pages/admin/MovimientosFinancierosPage'),
)
const InformesSemanalesPage = lazy(
  () => import('../pages/admin/InformesSemanalesPage'),
)
const LesionesPage = lazy(() => import('../pages/admin/LesionesPage'))
const SesionesPage = lazy(() => import('../pages/admin/SesionesPage'))
const SesionDetallePage = lazy(() => import('../pages/admin/SesionDetallePage'))
const DocumentosPage = lazy(() => import('../pages/admin/DocumentosPage'))
const NoticiasAdminPage = lazy(() => import('../pages/admin/NoticiasAdminPage'))
const UsuariosPage = lazy(() => import('../pages/admin/UsuariosPage'))
const PerfilPage = lazy(() => import('../pages/admin/PerfilPage'))


// ─── Loader global ────────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default function AppRouter() {
  const loadSession = useAuthStore((state) => state.loadSession)

  useEffect(() => {
    loadSession()
  }, [loadSession])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ─── PÚBLICO (sin login) ──────────────────────────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PublicHomePage />} />
            <Route path="/tabla" element={<TablaPosicionesPage />} />
            <Route path="/goleadores" element={<GoleadoresPage />} />
            <Route path="/tarjetas" element={<TarjetasPage />} />
            <Route path="/calendario" element={<CalendarioPage />} />
            <Route path="/noticias" element={<NoticiasPage />} />
            <Route path="/noticias/:id" element={<NoticiaDetallePage />} />
          </Route>

          {/* ─── AUTH ─────────────────────────────────────────────── */}
          <Route path="/login" element={<LoginPage />} />

          {/* ─── ADMIN (login + AppShell) ─────────────────────────── */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/perfil" element={<PerfilPage />} />

            {/* Comisión Técnica */}
            <Route
              path="/admin/temporadas"
              element={
                <ProtectedRoute requireGroup="Comision Tecnica">
                  <TemporadasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categorias"
              element={
                <ProtectedRoute requireGroup="Comision Tecnica">
                  <CategoriasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inscripciones"
              element={
                <ProtectedRoute requireGroup="Comision Tecnica">
                  <InscripcionesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jornadas"
              element={
                <ProtectedRoute requireGroup="Comision Tecnica">
                  <JornadasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jornadas/:id"
              element={
                <ProtectedRoute requireGroup="Comision Tecnica">
                  <JornadaDetallePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/partidos"
              element={
                <ProtectedRoute requireGroup="Comision Tecnica">
                  <PartidosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vocalias"
              element={
                <ProtectedRoute requireGroup="Comision Tecnica">
                  <VocaliasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vocalias/:id"
              element={
                <ProtectedRoute requireGroup="Comision Tecnica">
                  <VocaliaDetallePage />
                </ProtectedRoute>
              }
            />

            {/* Equipos (lectura para todos, escritura Comisión Técnica) */}
            <Route path="/admin/equipos" element={<EquiposPage />} />

            {/* Comisión Calificaciones */}
            <Route
              path="/admin/jugadores"
              element={
                <ProtectedRoute requireGroup="Comision Calificaciones">
                  <JugadoresPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/plantillas"
              element={
                <ProtectedRoute requireGroup="Comision Calificaciones">
                  <PlantillasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/capitanes"
              element={
                <ProtectedRoute requireGroup="Comision Calificaciones">
                  <CapitanesPage />
                </ProtectedRoute>
              }
            />

            {/* Comisión Penas */}
            <Route
              path="/admin/sanciones"
              element={
                <ProtectedRoute requireGroup="Comision Penas">
                  <SancionesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/multas"
              element={
                <ProtectedRoute requireGroup="Comision Penas">
                  <MultasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/recibos"
              element={
                <ProtectedRoute requireGroup="Comision Penas">
                  <RecibosPage />
                </ProtectedRoute>
              }
            />

            {/* Comisión Financiera */}
            <Route
              path="/admin/finanzas"
              element={
                <ProtectedRoute requireGroup="Comision Financiera">
                  <MovimientosFinancierosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/informes-semanales"
              element={
                <ProtectedRoute requireGroup="Comision Financiera">
                  <InformesSemanalesPage />
                </ProtectedRoute>
              }
            />

            {/* Comisión Seguro */}
            <Route
              path="/admin/lesiones"
              element={
                <ProtectedRoute requireGroup="Comision Seguro">
                  <LesionesPage />
                </ProtectedRoute>
              }
            />

            {/* Comisión Administrativa */}
            <Route
              path="/admin/sesiones"
              element={
                <ProtectedRoute requireGroup="Comision Administrativa">
                  <SesionesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sesiones/:id"
              element={
                <ProtectedRoute requireGroup="Comision Administrativa">
                  <SesionDetallePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/documentos"
              element={
                <ProtectedRoute requireGroup="Comision Administrativa">
                  <DocumentosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/noticias"
              element={
                <ProtectedRoute requireGroup="Comision Administrativa">
                  <NoticiasAdminPage />
                </ProtectedRoute>
              }
            />

            {/* Superadmin */}
            <Route
              path="/admin/usuarios"
              element={
                <ProtectedRoute requireStaff>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* ─── FALLBACK ─────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
