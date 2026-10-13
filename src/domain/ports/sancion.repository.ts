import type { Sancion, HistorialSancion } from '../entities/sancion.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListSancionesParams {
  page?: number
  pageSize?: number
  search?: string
  tipo?: string
  estado?: string
  jugador?: number
  equipo?: number
  partido?: number
}

export interface CreateSancionPayload {
  tipo: string
  jugador?: number | null
  equipo?: number | null
  partido?: number | null
  vocalia?: number | null
  motivo: string
  articulo?: string
  fecha_inicio: string
  fecha_fin?: string | null
  dias?: number
  partidos_sancion?: number
  estado?: string
  observaciones?: string
}

export interface UpdateSancionPayload {
  motivo?: string
  articulo?: string
  fecha_inicio?: string
  fecha_fin?: string | null
  dias?: number
  partidos_sancion?: number
  observaciones?: string
}

export interface CambiarEstadoSancionPayload {
  estado: string
  motivo_cambio?: string
}

export interface SancionRepository {
  list(params: ListSancionesParams): Promise<PaginatedResult<Sancion>>
  get(id: number): Promise<Sancion>
  create(payload: CreateSancionPayload): Promise<Sancion>
  update(id: number, payload: UpdateSancionPayload): Promise<Sancion>
  remove(id: number): Promise<void>
  cambiarEstado(
    id: number,
    payload: CambiarEstadoSancionPayload,
  ): Promise<Sancion>
  historial(sancionId: number): Promise<PaginatedResult<HistorialSancion>>
}
