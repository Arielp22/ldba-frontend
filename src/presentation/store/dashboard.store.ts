import { create } from 'zustand'
import { dashboardUseCase } from '@/infrastructure/factories/dashboard.factory'
import type { DashboardData } from '@/domain/entities/dashboard-summary.entity'

interface DashboardState {
  data: DashboardData | null
  isLoading: boolean
  error: string | null
  lastLoadedAt: number | null
}

interface DashboardActions {
  /**
   * Carga el dashboard completo.
   * @param temporadaId Temporada activa (para tabla y goleadores)
   * @param incluirAdmin Si true, incluye usuariosStats y finanzasResumen
   */
  load(temporadaId: number | null, incluirAdmin: boolean): Promise<void>
  reset(): void
}

export const useDashboardStore = create<DashboardState & DashboardActions>(
  (set) => ({
    data: null,
    isLoading: false,
    error: null,
    lastLoadedAt: null,

    async load(temporadaId, incluirAdmin) {
      set({ isLoading: true, error: null })
      try {
        const data = await dashboardUseCase.loadDashboard(
          temporadaId,
          incluirAdmin,
        )
        set({ data, isLoading: false, lastLoadedAt: Date.now() })
      } catch (err: unknown) {
        const apiErr = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: apiErr.detail ?? apiErr.message ?? 'Error al cargar dashboard',
        })
      }
    },

    reset() {
      set({ data: null, isLoading: false, error: null, lastLoadedAt: null })
    },
  }),
)
