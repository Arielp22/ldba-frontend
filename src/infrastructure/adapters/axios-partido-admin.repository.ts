import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  PartidoAdminRepository,
  ListPartidosParams,
  CreatePartidoPayload,
  UpdatePartidoPayload,
  RegistrarResultadoPayload,
} from '@/domain/ports/partido-admin.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type {
  PartidoAdmin,
  SorteoVocaliasResponse,
} from '@/domain/entities/partido-admin.entity'

export class AxiosPartidoAdminRepository implements PartidoAdminRepository {
  async list(
    params: ListPartidosParams,
  ): Promise<PaginatedResult<PartidoAdmin>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<PartidoAdmin>>(
        '/partidos/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            jornada: params.jornada,
            dia: params.dia,
            estado: params.estado,
            equipo_local: params.equipo_local,
            equipo_visitante: params.equipo_visitante,
            equipo_vocal: params.equipo_vocal,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<PartidoAdmin> {
    try {
      const { data } = await apiClient.get<PartidoAdmin>(`/partidos/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreatePartidoPayload): Promise<PartidoAdmin> {
    try {
      const { data } = await apiClient.post<PartidoAdmin>('/partidos/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(
    id: number,
    payload: UpdatePartidoPayload,
  ): Promise<PartidoAdmin> {
    try {
      const { data } = await apiClient.patch<PartidoAdmin>(
        `/partidos/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/partidos/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async registrarResultado(
    id: number,
    payload: RegistrarResultadoPayload,
  ): Promise<PartidoAdmin> {
    try {
      const { data } = await apiClient.post<PartidoAdmin>(
        `/partidos/${id}/resultado/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async sortearVocalias(jornadaId: number): Promise<SorteoVocaliasResponse> {
    try {
      const { data } = await apiClient.post<SorteoVocaliasResponse>(
        `/jornadas/${jornadaId}/sortear-vocalias/`,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
