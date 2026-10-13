import type { InformeFinancieroSemanal } from '../entities/informe-financiero.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListInformesParams {
  page?: number
  pageSize?: number
  search?: string
  estado?: string
  anio?: number
  numero_semana?: number
}

export interface CreateInformePayload {
  numero_semana: number
  anio: number
  fecha_semana: string
  cerveza?: string | number
  boleteria?: string | number
  multas?: string | number
  otros_ingresos?: string | number
  egresos?: string | number
  estado?: string
  observaciones?: string
}

export interface UpdateInformePayload {
  cerveza?: string | number
  boleteria?: string | number
  multas?: string | number
  otros_ingresos?: string | number
  egresos?: string | number
  estado?: string
  observaciones?: string
}

export interface InformeFinancieroRepository {
  list(
    params: ListInformesParams,
  ): Promise<PaginatedResult<InformeFinancieroSemanal>>
  get(id: number): Promise<InformeFinancieroSemanal>
  create(payload: CreateInformePayload): Promise<InformeFinancieroSemanal>
  update(
    id: number,
    payload: UpdateInformePayload,
  ): Promise<InformeFinancieroSemanal>
  remove(id: number): Promise<void>
}
