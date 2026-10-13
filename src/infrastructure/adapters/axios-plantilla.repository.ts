import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  PlantillaRepository,
  ListPlantillasParams,
  CreatePlantillaPayload,
} from '@/domain/ports/plantilla.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Plantilla } from '@/domain/entities/plantilla.entity'

export class AxiosPlantillaRepository implements PlantillaRepository {
  async list(
    params: ListPlantillasParams,
  ): Promise<PaginatedResult<Plantilla>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Plantilla>>(
        '/jugadores-equipo-temporada/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            temporada: params.temporada,
            categoria: params.categoria,
            equipo: params.equipo,
            jugador: params.jugador,
            activo: params.activo === undefined ? undefined : params.activo,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreatePlantillaPayload): Promise<Plantilla> {
    try {
      const { data } = await apiClient.post<Plantilla>(
        '/jugadores-equipo-temporada/',
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(
    id: number,
    payload: Partial<CreatePlantillaPayload>,
  ): Promise<Plantilla> {
    try {
      const { data } = await apiClient.patch<Plantilla>(
        `/jugadores-equipo-temporada/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/jugadores-equipo-temporada/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
