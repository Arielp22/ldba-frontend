import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  ReciboRepository,
  ListRecibosParams,
  CreateReciboPayload,
  UpdateReciboPayload,
} from '@/domain/ports/recibo.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Recibo } from '@/domain/entities/recibo.entity'

export class AxiosReciboRepository implements ReciboRepository {
  async list(params: ListRecibosParams): Promise<PaginatedResult<Recibo>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Recibo>>(
        '/recibos/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            search: params.search || undefined,
            multa: params.multa,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<Recibo> {
    try {
      const { data } = await apiClient.get<Recibo>(`/recibos/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateReciboPayload): Promise<Recibo> {
    try {
      const { data } = await apiClient.post<Recibo>('/recibos/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: UpdateReciboPayload): Promise<Recibo> {
    try {
      const { data } = await apiClient.patch<Recibo>(
        `/recibos/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/recibos/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
