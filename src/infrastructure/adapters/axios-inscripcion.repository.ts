import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  InscripcionRepository,
  ListInscripcionesParams,
  CreateInscripcionPayload,
} from '@/domain/ports/inscripcion.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Inscripcion } from '@/domain/entities/inscripcion.entity'

export class AxiosInscripcionRepository implements InscripcionRepository {
  async list(
    params: ListInscripcionesParams,
  ): Promise<PaginatedResult<Inscripcion>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Inscripcion>>(
        '/equipos-temporada-categoria/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            temporada: params.temporada,
            categoria: params.categoria,
            equipo: params.equipo,
            activo: params.activo === undefined ? undefined : params.activo,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateInscripcionPayload): Promise<Inscripcion> {
    try {
      const { data } = await apiClient.post<Inscripcion>(
        '/equipos-temporada-categoria/',
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(
    id: number,
    payload: Partial<CreateInscripcionPayload>,
  ): Promise<Inscripcion> {
    try {
      const { data } = await apiClient.patch<Inscripcion>(
        `/equipos-temporada-categoria/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/equipos-temporada-categoria/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
