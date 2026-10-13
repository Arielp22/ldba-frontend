import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  EquipoRepository,
  ListEquiposParams,
  CreateEquipoPayload,
  UpdateEquipoPayload,
} from '@/domain/ports/equipo.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Equipo } from '@/domain/entities/equipo.entity'

export class AxiosEquipoRepository implements EquipoRepository {
  async list(params: ListEquiposParams): Promise<PaginatedResult<Equipo>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Equipo>>(
        '/equipos/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            search: params.search || undefined,
            activo: params.activo === undefined ? undefined : params.activo,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<Equipo> {
    try {
      const { data } = await apiClient.get<Equipo>(`/equipos/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateEquipoPayload): Promise<Equipo> {
    try {
      const { data } = await apiClient.post<Equipo>('/equipos/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: UpdateEquipoPayload): Promise<Equipo> {
    try {
      const { data } = await apiClient.patch<Equipo>(`/equipos/${id}/`, payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/equipos/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async resetPassword(id: number, newPassword: string): Promise<void> {
    try {
      await apiClient.post(`/equipos/${id}/reset-password/`, {
        new_password: newPassword,
        new_password2: newPassword,
      })
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
