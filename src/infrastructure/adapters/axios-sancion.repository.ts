import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  SancionRepository,
  ListSancionesParams,
  CreateSancionPayload,
  UpdateSancionPayload,
  CambiarEstadoSancionPayload,
} from '@/domain/ports/sancion.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type {
  Sancion,
  HistorialSancion,
} from '@/domain/entities/sancion.entity'

export class AxiosSancionRepository implements SancionRepository {
  async list(params: ListSancionesParams): Promise<PaginatedResult<Sancion>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Sancion>>(
        '/sanciones/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            search: params.search || undefined,
            tipo: params.tipo,
            estado: params.estado,
            jugador: params.jugador,
            equipo: params.equipo,
            partido: params.partido,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<Sancion> {
    try {
      const { data } = await apiClient.get<Sancion>(`/sanciones/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateSancionPayload): Promise<Sancion> {
    try {
      const { data } = await apiClient.post<Sancion>('/sanciones/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: UpdateSancionPayload): Promise<Sancion> {
    try {
      const { data } = await apiClient.patch<Sancion>(
        `/sanciones/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/sanciones/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async cambiarEstado(
    id: number,
    payload: CambiarEstadoSancionPayload,
  ): Promise<Sancion> {
    try {
      const { data } = await apiClient.post<Sancion>(
        `/sanciones/${id}/cambiar-estado/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async historial(
    sancionId: number,
  ): Promise<PaginatedResult<HistorialSancion>> {
    try {
      const { data } = await apiClient.get<
        PaginatedResult<HistorialSancion>
      >('/historial-sanciones/', { params: { sancion: sancionId } })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
