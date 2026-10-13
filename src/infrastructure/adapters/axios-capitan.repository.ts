import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  CapitanRepository,
  ListCapitanesParams,
  CreateCapitanPayload,
} from '@/domain/ports/capitan.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Capitan } from '@/domain/entities/capitan.entity'

export class AxiosCapitanRepository implements CapitanRepository {
  async list(
    params: ListCapitanesParams,
  ): Promise<PaginatedResult<Capitan>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Capitan>>(
        '/capitanes-equipo-temporada/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            temporada: params.temporada,
            categoria: params.categoria,
            equipo: params.equipo,
            jugador: params.jugador,
            activo: params.activo === undefined ? undefined : params.activo,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateCapitanPayload): Promise<Capitan> {
    try {
      const { data } = await apiClient.post<Capitan>(
        '/capitanes-equipo-temporada/',
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(
    id: number,
    payload: Partial<CreateCapitanPayload>,
  ): Promise<Capitan> {
    try {
      const { data } = await apiClient.patch<Capitan>(
        `/capitanes-equipo-temporada/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/capitanes-equipo-temporada/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
