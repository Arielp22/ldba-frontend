import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  MultaRepository,
  ListMultasParams,
  CreateMultaPayload,
  UpdateMultaPayload,
  MarcarPagadaPayload,
} from '@/domain/ports/multa.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Multa } from '@/domain/entities/multa.entity'

export class AxiosMultaRepository implements MultaRepository {
  async list(params: ListMultasParams): Promise<PaginatedResult<Multa>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Multa>>(
        '/multas/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            search: params.search || undefined,
            estado: params.estado,
            equipo: params.equipo,
            sancion: params.sancion,
            forma_pago: params.forma_pago,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<Multa> {
    try {
      const { data } = await apiClient.get<Multa>(`/multas/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateMultaPayload): Promise<Multa> {
    try {
      const { data } = await apiClient.post<Multa>('/multas/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: UpdateMultaPayload): Promise<Multa> {
    try {
      const { data } = await apiClient.patch<Multa>(`/multas/${id}/`, payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/multas/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async marcarPagada(
    id: number,
    payload: MarcarPagadaPayload,
  ): Promise<Multa> {
    try {
      const { data } = await apiClient.post<Multa>(
        `/multas/${id}/marcar-pagada/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
