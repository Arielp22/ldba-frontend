import type { Categoria } from '../entities/categoria.entity'

export interface PaginatedResult<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ListCategoriasParams {
  page?: number
  pageSize?: number
  search?: string
  activa?: boolean
}

export interface CategoriaRepository {
  list(params: ListCategoriasParams): Promise<PaginatedResult<Categoria>>
  get(id: number): Promise<Categoria>
  create(data: Partial<Categoria>): Promise<Categoria>
  update(id: number, data: Partial<Categoria>): Promise<Categoria>
  remove(id: number): Promise<void>
}
