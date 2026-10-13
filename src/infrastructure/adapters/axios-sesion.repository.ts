import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  SesionRepository,
  ListSesionesParams,
  CreateSesionPayload,
  UpdateSesionPayload,
} from '@/domain/ports/sesion.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Sesion } from '@/domain/entities/sesion.entity'

export class AxiosSesionRepository implements SesionRepository {
  async list(params: ListSesionesParams): Promise<PaginatedResult<Sesion>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Sesion>>(
        '/sesiones/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            search: params.search || undefined,
            tipo: params.tipo,
            estado: params.estado,
            fecha: params.fecha,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<Sesion> {
    try {
      const { data } = await apiClient.get<Sesion>(`/sesiones/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateSesionPayload): Promise<Sesion> {
    try {
      const { data } = await apiClient.post<Sesion>('/sesiones/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: UpdateSesionPayload): Promise<Sesion> {
    try {
      const { data } = await apiClient.patch<Sesion>(
        `/sesiones/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/sesiones/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async finalizar(id: number): Promise<Sesion> {
    try {
      const { data } = await apiClient.post<Sesion>(
        `/sesiones/${id}/finalizar/`,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
