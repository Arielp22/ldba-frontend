import type { Jugador } from '../entities/jugador.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListJugadoresParams {
  page?: number
  pageSize?: number
  search?: string
  estado_calificacion?: string
  activo?: boolean
}

export interface CreateJugadorPayload {
  nombres: string
  apellidos: string
  cedula: string
  fecha_nacimiento: string
  telefono?: string
  email?: string
  direccion?: string
  foto?: string
  numero_carnet?: string
  estado_calificacion?: string
  observaciones?: string
  activo?: boolean
}

export interface UpdateJugadorPayload {
  nombres?: string
  apellidos?: string
  cedula?: string
  fecha_nacimiento?: string
  telefono?: string
  email?: string
  direccion?: string
  foto?: string
  numero_carnet?: string
  estado_calificacion?: string
  observaciones?: string
  activo?: boolean
}

export interface CalificarJugadorPayload {
  estado_calificacion: string
  observaciones?: string
}

export interface ImportJugadoresResult {
  success: boolean
  creados: number
}

export interface ImportJugadoresError {
  fila: number
  error: string
}

export interface JugadorRepository {
  list(params: ListJugadoresParams): Promise<PaginatedResult<Jugador>>
  get(id: number): Promise<Jugador>
  create(payload: CreateJugadorPayload): Promise<Jugador>
  update(id: number, payload: UpdateJugadorPayload): Promise<Jugador>
  remove(id: number): Promise<void>
  calificar(id: number, payload: CalificarJugadorPayload): Promise<Jugador>
  importarExcel(file: File): Promise<ImportJugadoresResult>
}
