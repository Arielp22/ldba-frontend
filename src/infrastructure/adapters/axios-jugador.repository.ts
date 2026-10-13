import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  JugadorRepository,
  ListJugadoresParams,
  CreateJugadorPayload,
  UpdateJugadorPayload,
  CalificarJugadorPayload,
} from '@/domain/ports/jugador.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Jugador } from '@/domain/entities/jugador.entity'

export class AxiosJugadorRepository implements JugadorRepository {
  async list(params: ListJugadoresParams): Promise<PaginatedResult<Jugador>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Jugador>>(
        '/jugadores/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            search: params.search || undefined,
            estado_calificacion: params.estado_calificacion || undefined,
            activo: params.activo === undefined ? undefined : params.activo,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<Jugador> {
    try {
      const { data } = await apiClient.get<Jugador>(`/jugadores/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateJugadorPayload): Promise<Jugador> {
    try {
      const { data } = await apiClient.post<Jugador>('/jugadores/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: UpdateJugadorPayload): Promise<Jugador> {
    try {
      const { data } = await apiClient.patch<Jugador>(
        `/jugadores/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/jugadores/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async calificar(
    id: number,
    payload: CalificarJugadorPayload,
  ): Promise<Jugador> {
    try {
      const { data } = await apiClient.post<Jugador>(
        `/jugadores/${id}/calificar/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
