import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  CategoriaRepository,
  ListCategoriasParams,
  PaginatedResult,
} from '@/domain/ports/categoria.repository'
import type { Categoria } from '@/domain/entities/categoria.entity'

export class AxiosCategoriaRepository implements CategoriaRepository {
  async list(
    params: ListCategoriasParams,
  ): Promise<PaginatedResult<Categoria>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Categoria>>(
        '/categorias/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            search: params.search || undefined,
            activa:
              params.activa === undefined ? undefined : params.activa,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<Categoria> {
    try {
      const { data } = await apiClient.get<Categoria>(`/categorias/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: Partial<Categoria>): Promise<Categoria> {
    try {
      const { data } = await apiClient.post<Categoria>('/categorias/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: Partial<Categoria>): Promise<Categoria> {
    try {
      const { data } = await apiClient.patch<Categoria>(
        `/categorias/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/categorias/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
