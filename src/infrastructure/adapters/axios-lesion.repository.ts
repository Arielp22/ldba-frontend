import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  LesionRepository,
  ListLesionesParams,
  CreateLesionPayload,
  UpdateLesionPayload,
  CambiarEstadoLesionPayload,
} from '@/domain/ports/lesion.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Lesion } from '@/domain/entities/lesion.entity'

export class AxiosLesionRepository implements LesionRepository {
  async list(params: ListLesionesParams): Promise<PaginatedResult<Lesion>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Lesion>>(
        '/lesiones/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            search: params.search || undefined,
            estado: params.estado,
            gravedad: params.gravedad,
            tipo: params.tipo,
            jugador: params.jugador,
            equipo: params.equipo,
            fecha: params.fecha,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<Lesion> {
    try {
      const { data } = await apiClient.get<Lesion>(`/lesiones/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateLesionPayload): Promise<Lesion> {
    try {
      const { data } = await apiClient.post<Lesion>('/lesiones/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: UpdateLesionPayload): Promise<Lesion> {
    try {
      const { data } = await apiClient.patch<Lesion>(
        `/lesiones/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/lesiones/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async cambiarEstado(
    id: number,
    payload: CambiarEstadoLesionPayload,
  ): Promise<Lesion> {
    try {
      const { data } = await apiClient.post<Lesion>(
        `/lesiones/${id}/cambiar-estado/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
