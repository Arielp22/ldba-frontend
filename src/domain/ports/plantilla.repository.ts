import type { Plantilla } from '../entities/plantilla.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListPlantillasParams {
  page?: number
  pageSize?: number
  temporada?: number
  categoria?: number
  equipo?: number
  jugador?: number
  activo?: boolean
}

export interface CreatePlantillaPayload {
  jugador: number
  equipo: number
  temporada: number
  categoria: number
  activo?: boolean
}

export interface PlantillaRepository {
  list(params: ListPlantillasParams): Promise<PaginatedResult<Plantilla>>
  create(payload: CreatePlantillaPayload): Promise<Plantilla>
  update(
    id: number,
    payload: Partial<CreatePlantillaPayload>,
  ): Promise<Plantilla>
  remove(id: number): Promise<void>
}
