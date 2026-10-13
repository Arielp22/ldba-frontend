import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  VocaliaJugadorRepository,
  ListVocaliaJugadoresParams,
  CreateVocaliaJugadorPayload,
  UpdateVocaliaJugadorPayload,
} from '@/domain/ports/vocalia-jugador.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { VocaliaJugador } from '@/domain/entities/vocalia-jugador.entity'

export class AxiosVocaliaJugadorRepository
  implements VocaliaJugadorRepository
{
  async list(
    params: ListVocaliaJugadoresParams,
  ): Promise<PaginatedResult<VocaliaJugador>> {
    try {
      const { data } = await apiClient.get<
        PaginatedResult<VocaliaJugador>
      >('/vocalia-jugadores/', {
        params: {
          page: params.page ?? 1,
          page_size: params.pageSize ?? 10,
          search: params.search || undefined,
          vocalia: params.vocalia,
          jugador: params.jugador,
          equipo: params.equipo,
        },
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(
    payload: CreateVocaliaJugadorPayload,
  ): Promise<VocaliaJugador> {
    try {
      const { data } = await apiClient.post<VocaliaJugador>(
        '/vocalia-jugadores/',
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(
    id: number,
    payload: UpdateVocaliaJugadorPayload,
  ): Promise<VocaliaJugador> {
    try {
      const { data } = await apiClient.patch<VocaliaJugador>(
        `/vocalia-jugadores/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/vocalia-jugadores/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
