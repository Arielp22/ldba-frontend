import type { Sesion } from '../entities/sesion.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListSesionesParams {
  page?: number
  pageSize?: number
  search?: string
  tipo?: string
  estado?: string
  fecha?: string
}

export interface CreateSesionPayload {
  fecha: string
  tipo?: string
  orden_del_dia?: string
  acta?: string
  estado?: string
  observaciones?: string
}

export interface UpdateSesionPayload {
  fecha?: string
  tipo?: string
  orden_del_dia?: string
  acta?: string
  estado?: string
  observaciones?: string
}

export interface SesionRepository {
  list(params: ListSesionesParams): Promise<PaginatedResult<Sesion>>
  get(id: number): Promise<Sesion>
  create(payload: CreateSesionPayload): Promise<Sesion>
  update(id: number, payload: UpdateSesionPayload): Promise<Sesion>
  remove(id: number): Promise<void>
  finalizar(id: number): Promise<Sesion>
}
