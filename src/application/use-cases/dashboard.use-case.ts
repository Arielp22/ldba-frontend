import type { DashboardRepository } from '@/domain/ports/dashboard.repository'
import type { DashboardData } from '@/domain/entities/dashboard-summary.entity'

export class DashboardUseCase {
  constructor(private readonly repo: DashboardRepository) {}

  /**
   * Carga todos los widgets del dashboard en paralelo.
   * Usa Promise.allSettled para que el fallo de un endpoint
   * no tumbe los demás.
   *
   * @param temporadaId Temporada activa (para tabla y goleadores)
   * @param incluirAdmin Si es true, también carga usuarios + finanzas
   */
  async loadDashboard(
    temporadaId: number | null,
    incluirAdmin: boolean,
  ): Promise<DashboardData> {
    const [
      proximosPartidos,
      resultadosRecientes,
      ultimasNoticias,
      topPosiciones,
      topGoleadores,
      usuariosStats,
      finanzasResumen,
    ] = await Promise.allSettled([
      this.repo.getProximosPartidos(5),
      this.repo.getResultadosRecientes(5),
      this.repo.getUltimasNoticias(5),
      temporadaId
        ? this.repo.getTopPosiciones(temporadaId, 5)
        : Promise.resolve([]),
      temporadaId
        ? this.repo.getTopGoleadores(temporadaId, 5)
        : Promise.resolve([]),
      incluirAdmin ? this.repo.getUsuariosStats() : Promise.resolve(null),
      incluirAdmin ? this.repo.getFinanzasResumen() : Promise.resolve(null),
    ])

    const pick = <T,>(r: PromiseSettledResult<T>, fallback: T): T =>
      r.status === 'fulfilled' ? r.value : fallback

    return {
      proximosPartidos: pick(proximosPartidos, []),
      resultadosRecientes: pick(resultadosRecientes, []),
      ultimasNoticias: pick(ultimasNoticias, []),
      topPosiciones: pick(topPosiciones, []),
      topGoleadores: pick(topGoleadores, []),
      usuariosStats: pick(usuariosStats, null),
      finanzasResumen: pick(finanzasResumen, null),
    }
  }
}
