import type { Vocalia } from '../entities/vocalia.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListVocaliasParams {
  page?: number
  pageSize?: number
  search?: string
  estado?: string
  partido?: number
}

export interface CreateVocaliaPayload {
  partido?: number | null
  arbitro: string
  vocal: string
  goles_local?: number | null
  goles_visitante?: number | null
  informe?: string
  firma_arbitro?: string
  firma_vocal?: string
  estado?: string
}

export interface UpdateVocaliaPayload {
  arbitro?: string
  vocal?: string
  goles_local?: number | null
  goles_visitante?: number | null
  informe?: string
  firma_arbitro?: string
  firma_vocal?: string
  estado?: string
}

export interface VocaliaRepository {
  list(params: ListVocaliasParams): Promise<PaginatedResult<Vocalia>>
  get(id: number): Promise<Vocalia>
  create(payload: CreateVocaliaPayload): Promise<Vocalia>
  update(id: number, payload: UpdateVocaliaPayload): Promise<Vocalia>
  remove(id: number): Promise<void>
  aprobar(id: number): Promise<Vocalia>
  rechazar(id: number, observaciones: string): Promise<Vocalia>
  sincronizarResultado(id: number): Promise<Vocalia>
}
