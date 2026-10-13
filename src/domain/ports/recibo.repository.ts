import type { Recibo } from '../entities/recibo.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListRecibosParams {
  page?: number
  pageSize?: number
  search?: string
  multa?: number
}

export interface CreateReciboPayload {
  multa: number
  numero: string
  entregado_a: string
  entregado_por: string
  fecha_entrega: string
  observaciones?: string
}

export interface UpdateReciboPayload {
  numero?: string
  entregado_a?: string
  entregado_por?: string
  fecha_entrega?: string
  observaciones?: string
}

export interface ReciboRepository {
  list(params: ListRecibosParams): Promise<PaginatedResult<Recibo>>
  get(id: number): Promise<Recibo>
  create(payload: CreateReciboPayload): Promise<Recibo>
  update(id: number, payload: UpdateReciboPayload): Promise<Recibo>
  remove(id: number): Promise<void>
}
