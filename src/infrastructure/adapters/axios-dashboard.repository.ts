import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { DashboardRepository } from '@/domain/ports/dashboard.repository'
import type { Partido } from '@/domain/entities/partido.entity'
import type { Noticia } from '@/domain/entities/noticia.entity'
import type { Posicion } from '@/domain/entities/posicion.entity'
import type { Goleador } from '@/domain/entities/goleador.entity'
import type { UsuarioStats } from '@/domain/entities/usuario-stats.entity'
import type { MovimientoResumen } from '@/domain/entities/movimiento-resumen.entity'

interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface TablaPosicionesResponse {
  temporada: number
  categoria: number | null
  tabla: Posicion[]
}

interface GoleadoresResponse {
  temporada: number
  categoria: number | null
  goleadores: Goleador[]
}

export class AxiosDashboardRepository implements DashboardRepository {
  async getProximosPartidos(limit = 5): Promise<Partido[]> {
    try {
      const { data } = await apiClient.get<Partido[]>(
        '/publico/partidos/proximos/',
      )
      return data.slice(0, limit)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getResultadosRecientes(limit = 5): Promise<Partido[]> {
    try {
      const { data } = await apiClient.get<Partido[]>(
        '/publico/partidos/recientes/',
      )
      return data.slice(0, limit)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getUltimasNoticias(limit = 5): Promise<Noticia[]> {
    try {
      const { data } = await apiClient.get<Paginated<Noticia>>(
        '/publico/noticias/',
        { params: { page_size: limit } },
      )
      return data.results
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getTopPosiciones(
    temporadaId: number,
    limit = 5,
  ): Promise<Posicion[]> {
    try {
      const { data } = await apiClient.get<TablaPosicionesResponse>(
        '/publico/tabla-posiciones/',
        { params: { temporada: temporadaId } },
      )
      return data.tabla.slice(0, limit)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getTopGoleadores(
    temporadaId: number,
    limit = 5,
  ): Promise<Goleador[]> {
    try {
      const { data } = await apiClient.get<GoleadoresResponse>(
        '/publico/goleadores/',
        { params: { temporada: temporadaId, limit } },
      )
      return data.goleadores
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getUsuariosStats(): Promise<UsuarioStats> {
    try {
      const { data } = await apiClient.get<UsuarioStats>('/users/stats/')
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getFinanzasResumen(): Promise<MovimientoResumen> {
    try {
      const { data } = await apiClient.get<MovimientoResumen>(
        '/movimientos-financieros/resumen/',
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
