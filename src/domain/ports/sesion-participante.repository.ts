import type { SesionParticipante } from '../entities/sesion-participante.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListSesionParticipantesParams {
  page?: number
  pageSize?: number
  search?: string
  sesion?: number
  presente?: boolean
}

export interface CreateSesionParticipantePayload {
  sesion: number
  nombre: string
  cargo?: string
  presente?: boolean
  observaciones?: string
}

export interface UpdateSesionParticipantePayload {
  nombre?: string
  cargo?: string
  presente?: boolean
  observaciones?: string
}

export interface SesionParticipanteRepository {
  list(
    params: ListSesionParticipantesParams,
  ): Promise<PaginatedResult<SesionParticipante>>
  create(
    payload: CreateSesionParticipantePayload,
  ): Promise<SesionParticipante>
  update(
    id: number,
    payload: UpdateSesionParticipantePayload,
  ): Promise<SesionParticipante>
  remove(id: number): Promise<void>
}
