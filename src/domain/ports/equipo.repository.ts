import type { Equipo } from '../entities/equipo.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListEquiposParams {
  page?: number
  pageSize?: number
  search?: string
  activo?: boolean
}

export interface CreateEquipoPayload {
  nombre: string
  siglas?: string
  color_principal?: string
  color_secundario?: string
  logo?: string
  presidente?: string
  telefono?: string
  email?: string
  activo?: boolean
  username: string
  password: string
}

export interface UpdateEquipoPayload {
  nombre?: string
  siglas?: string
  color_principal?: string
  color_secundario?: string
  logo?: string
  presidente?: string
  telefono?: string
  email?: string
  activo?: boolean
}

export interface EquipoRepository {
  list(params: ListEquiposParams): Promise<PaginatedResult<Equipo>>
  get(id: number): Promise<Equipo>
  create(payload: CreateEquipoPayload): Promise<Equipo>
  update(id: number, payload: UpdateEquipoPayload): Promise<Equipo>
  remove(id: number): Promise<void>
  resetPassword(id: number, newPassword: string): Promise<void>
}
