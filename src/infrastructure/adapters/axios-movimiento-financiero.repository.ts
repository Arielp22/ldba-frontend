import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  MovimientoFinancieroRepository,
  ListMovimientosParams,
  CreateMovimientoPayload,
  UpdateMovimientoPayload,
} from '@/domain/ports/movimiento-financiero.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type {
  MovimientoFinanciero,
  MovimientoResumen,
} from '@/domain/entities/movimiento-financiero.entity'

export class AxiosMovimientoFinancieroRepository
  implements MovimientoFinancieroRepository
{
  async list(
    params: ListMovimientosParams,
  ): Promise<PaginatedResult<MovimientoFinanciero>> {
    try {
      const { data } = await apiClient.get<
        PaginatedResult<MovimientoFinanciero>
      >('/movimientos-financieros/', {
        params: {
          page: params.page ?? 1,
          page_size: params.pageSize ?? 10,
          search: params.search || undefined,
          tipo: params.tipo,
          fecha: params.fecha,
          responsable: params.responsable,
        },
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<MovimientoFinanciero> {
    try {
      const { data } = await apiClient.get<MovimientoFinanciero>(
        `/movimientos-financieros/${id}/`,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(
    payload: CreateMovimientoPayload,
  ): Promise<MovimientoFinanciero> {
    try {
      const { data } = await apiClient.post<MovimientoFinanciero>(
        '/movimientos-financieros/',
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(
    id: number,
    payload: UpdateMovimientoPayload,
  ): Promise<MovimientoFinanciero> {
    try {
      const { data } = await apiClient.patch<MovimientoFinanciero>(
        `/movimientos-financieros/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/movimientos-financieros/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async resumen(
    params?: ListMovimientosParams,
  ): Promise<MovimientoResumen> {
    try {
      const { data } = await apiClient.get<MovimientoResumen>(
        '/movimientos-financieros/resumen/',
        {
          params: {
            tipo: params?.tipo,
            fecha: params?.fecha,
            responsable: params?.responsable,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
