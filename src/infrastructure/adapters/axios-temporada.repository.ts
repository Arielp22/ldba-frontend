import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  TemporadaRepository,
  ListTemporadasParams,
} from '@/domain/ports/temporada.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Temporada } from '@/domain/entities/temporada.entity'

export class AxiosTemporadaRepository implements TemporadaRepository {
  async list(
    params: ListTemporadasParams,
  ): Promise<PaginatedResult<Temporada>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Temporada>>(
        '/temporadas/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            search: params.search || undefined,
            estado: params.estado || undefined,
            anio: params.anio || undefined,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<Temporada> {
    try {
      const { data } = await apiClient.get<Temporada>(`/temporadas/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: Partial<Temporada>): Promise<Temporada> {
    try {
      const { data } = await apiClient.post<Temporada>('/temporadas/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: Partial<Temporada>): Promise<Temporada> {
    try {
      const { data } = await apiClient.patch<Temporada>(
        `/temporadas/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/temporadas/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
