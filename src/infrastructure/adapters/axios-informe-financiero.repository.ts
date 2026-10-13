import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  InformeFinancieroRepository,
  ListInformesParams,
  CreateInformePayload,
  UpdateInformePayload,
} from '@/domain/ports/informe-financiero.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { InformeFinancieroSemanal } from '@/domain/entities/informe-financiero.entity'

export class AxiosInformeFinancieroRepository
  implements InformeFinancieroRepository
{
  async list(
    params: ListInformesParams,
  ): Promise<PaginatedResult<InformeFinancieroSemanal>> {
    try {
      const { data } = await apiClient.get<
        PaginatedResult<InformeFinancieroSemanal>
      >('/informes-financieros-semanales/', {
        params: {
          page: params.page ?? 1,
          page_size: params.pageSize ?? 10,
          search: params.search || undefined,
          estado: params.estado,
          anio: params.anio,
          numero_semana: params.numero_semana,
        },
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<InformeFinancieroSemanal> {
    try {
      const { data } = await apiClient.get<InformeFinancieroSemanal>(
        `/informes-financieros-semanales/${id}/`,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(
    payload: CreateInformePayload,
  ): Promise<InformeFinancieroSemanal> {
    try {
      const { data } = await apiClient.post<InformeFinancieroSemanal>(
        '/informes-financieros-semanales/',
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(
    id: number,
    payload: UpdateInformePayload,
  ): Promise<InformeFinancieroSemanal> {
    try {
      const { data } = await apiClient.patch<InformeFinancieroSemanal>(
        `/informes-financieros-semanales/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/informes-financieros-semanales/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
