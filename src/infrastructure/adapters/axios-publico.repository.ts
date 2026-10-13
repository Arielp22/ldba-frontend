import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  PublicoRepository,
  TablaPosicionesResponse,
  GoleadoresResponse,
  TarjetasResponse,
} from '@/domain/ports/publico.repository'
import type { Temporada } from '@/domain/entities/temporada.entity'
import type { Categoria } from '@/domain/entities/categoria.entity'
import type { Equipo } from '@/domain/entities/equipo.entity'
import type { NoticiaPublica } from '@/domain/entities/noticia.entity'
import type { Partido } from '@/domain/entities/partido.entity'

interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export class AxiosPublicoRepository implements PublicoRepository {
  async getTemporadas(): Promise<Temporada[]> {
    try {
      const { data } = await apiClient.get<Paginated<Temporada>>(
        '/publico/temporadas/',
        { params: { page_size: 100 } },
      )
      return data.results
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getCategorias(): Promise<Categoria[]> {
    try {
      const { data } = await apiClient.get<Paginated<Categoria>>(
        '/publico/categorias/',
        { params: { page_size: 100 } },
      )
      return data.results
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getEquipos(): Promise<Equipo[]> {
    try {
      const { data } = await apiClient.get<Paginated<Equipo>>(
        '/publico/equipos/',
        { params: { page_size: 200 } },
      )
      return data.results
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getTablaPosiciones(
    temporadaId: number,
    categoriaId?: number,
  ): Promise<TablaPosicionesResponse> {
    try {
      const { data } = await apiClient.get<TablaPosicionesResponse>(
        '/publico/tabla-posiciones/',
        {
          params: {
            temporada: temporadaId,
            categoria: categoriaId,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getGoleadores(
    temporadaId: number,
    categoriaId?: number,
    limit?: number,
  ): Promise<GoleadoresResponse> {
    try {
      const { data } = await apiClient.get<GoleadoresResponse>(
        '/publico/goleadores/',
        {
          params: {
            temporada: temporadaId,
            categoria: categoriaId,
            limit,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getTarjetas(
    temporadaId: number,
    categoriaId?: number,
  ): Promise<TarjetasResponse> {
    try {
      const { data } = await apiClient.get<TarjetasResponse>(
        '/publico/tarjetas/',
        {
          params: {
            temporada: temporadaId,
            categoria: categoriaId,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getNoticias(page = 1, pageSize = 10) {
    try {
      const { data } = await apiClient.get<Paginated<NoticiaPublica>>(
        '/publico/noticias/',
        { params: { page, page_size: pageSize } },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getNoticiaDetalle(id: number): Promise<NoticiaPublica> {
    try {
      const { data } = await apiClient.get<NoticiaPublica>(
        `/publico/noticias/${id}/`,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getProximosPartidos(): Promise<Partido[]> {
    try {
      const { data } = await apiClient.get<Partido[]>(
        '/publico/partidos/proximos/',
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getResultadosRecientes(): Promise<Partido[]> {
    try {
      const { data } = await apiClient.get<Partido[]>(
        '/publico/partidos/recientes/',
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
