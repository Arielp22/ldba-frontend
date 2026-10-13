import type {
  MovimientoFinanciero,
  MovimientoResumen,
} from '../entities/movimiento-financiero.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListMovimientosParams {
  page?: number
  pageSize?: number
  search?: string
  tipo?: string
  fecha?: string
  responsable?: string
}

export interface CreateMovimientoPayload {
  tipo: string
  concepto: string
  fecha: string
  valor: string | number
  responsable?: string
  comprobante?: string
  observaciones?: string
}

export interface UpdateMovimientoPayload {
  tipo?: string
  concepto?: string
  fecha?: string
  valor?: string | number
  responsable?: string
  comprobante?: string
  observaciones?: string
}

export interface MovimientoFinancieroRepository {
  list(
    params: ListMovimientosParams,
  ): Promise<PaginatedResult<MovimientoFinanciero>>
  get(id: number): Promise<MovimientoFinanciero>
  create(payload: CreateMovimientoPayload): Promise<MovimientoFinanciero>
  update(
    id: number,
    payload: UpdateMovimientoPayload,
  ): Promise<MovimientoFinanciero>
  remove(id: number): Promise<void>
  resumen(params?: ListMovimientosParams): Promise<MovimientoResumen>
}
