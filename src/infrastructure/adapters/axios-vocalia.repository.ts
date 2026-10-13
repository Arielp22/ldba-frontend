import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  VocaliaRepository,
  ListVocaliasParams,
  CreateVocaliaPayload,
  UpdateVocaliaPayload,
} from '@/domain/ports/vocalia.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Vocalia } from '@/domain/entities/vocalia.entity'

export class AxiosVocaliaRepository implements VocaliaRepository {
  async list(params: ListVocaliasParams): Promise<PaginatedResult<Vocalia>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Vocalia>>(
        '/vocalias/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            search: params.search || undefined,
            estado: params.estado,
            partido: params.partido,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<Vocalia> {
    try {
      const { data } = await apiClient.get<Vocalia>(`/vocalias/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateVocaliaPayload): Promise<Vocalia> {
    try {
      const { data } = await apiClient.post<Vocalia>('/vocalias/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: UpdateVocaliaPayload): Promise<Vocalia> {
    try {
      const { data } = await apiClient.patch<Vocalia>(
        `/vocalias/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/vocalias/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async aprobar(id: number): Promise<Vocalia> {
    try {
      const { data } = await apiClient.post<Vocalia>(
        `/vocalias/${id}/aprobar/`,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async rechazar(id: number, observaciones: string): Promise<Vocalia> {
    try {
      const { data } = await apiClient.post<Vocalia>(
        `/vocalias/${id}/rechazar/`,
        { observaciones_rechazo: observaciones },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async sincronizarResultado(id: number): Promise<Vocalia> {
    try {
      const { data } = await apiClient.post<Vocalia>(
        `/vocalias/${id}/sincronizar-resultado/`,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
