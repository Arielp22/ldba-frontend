import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  SesionParticipanteRepository,
  ListSesionParticipantesParams,
  CreateSesionParticipantePayload,
  UpdateSesionParticipantePayload,
} from '@/domain/ports/sesion-participante.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { SesionParticipante } from '@/domain/entities/sesion-participante.entity'

export class AxiosSesionParticipanteRepository
  implements SesionParticipanteRepository
{
  async list(
    params: ListSesionParticipantesParams,
  ): Promise<PaginatedResult<SesionParticipante>> {
    try {
      const { data } = await apiClient.get<
        PaginatedResult<SesionParticipante>
      >('/sesion-participantes/', {
        params: {
          page: params.page ?? 1,
          page_size: params.pageSize ?? 100,
          search: params.search || undefined,
          sesion: params.sesion,
          presente: params.presente,
        },
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(
    payload: CreateSesionParticipantePayload,
  ): Promise<SesionParticipante> {
    try {
      const { data } = await apiClient.post<SesionParticipante>(
        '/sesion-participantes/',
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(
    id: number,
    payload: UpdateSesionParticipantePayload,
  ): Promise<SesionParticipante> {
    try {
      const { data } = await apiClient.patch<SesionParticipante>(
        `/sesion-participantes/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/sesion-participantes/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
