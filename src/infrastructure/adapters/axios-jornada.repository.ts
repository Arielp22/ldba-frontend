import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  JornadaRepository,
  ListJornadasParams,
  CreateJornadaPayload,
} from '@/domain/ports/jornada.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Jornada } from '@/domain/entities/jornada.entity'

export class AxiosJornadaRepository implements JornadaRepository {
  async list(params: ListJornadasParams): Promise<PaginatedResult<Jornada>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Jornada>>(
        '/jornadas/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            search: params.search || undefined,
            temporada: params.temporada,
            categoria: params.categoria,
            estado: params.estado,
            numero: params.numero,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<Jornada> {
    try {
      const { data } = await apiClient.get<Jornada>(`/jornadas/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateJornadaPayload): Promise<Jornada> {
    try {
      const { data } = await apiClient.post<Jornada>('/jornadas/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(
    id: number,
    payload: Partial<CreateJornadaPayload>,
  ): Promise<Jornada> {
    try {
      const { data } = await apiClient.patch<Jornada>(
        `/jornadas/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/jornadas/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
