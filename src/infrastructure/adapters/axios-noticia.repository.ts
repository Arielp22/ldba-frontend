import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  NoticiaRepository,
  ListNoticiasParams,
  CreateNoticiaPayload,
  UpdateNoticiaPayload,
} from '@/domain/ports/noticia.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Noticia } from '@/domain/entities/noticia.entity'

export class AxiosNoticiaRepository implements NoticiaRepository {
  async list(params: ListNoticiasParams): Promise<PaginatedResult<Noticia>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Noticia>>(
        '/noticias/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            search: params.search || undefined,
            publicada: params.publicada,
            destacada: params.destacada,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<Noticia> {
    try {
      const { data } = await apiClient.get<Noticia>(`/noticias/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateNoticiaPayload): Promise<Noticia> {
    try {
      const { data } = await apiClient.post<Noticia>('/noticias/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: UpdateNoticiaPayload): Promise<Noticia> {
    try {
      const { data } = await apiClient.patch<Noticia>(
        `/noticias/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/noticias/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async publicar(id: number): Promise<Noticia> {
    try {
      const { data } = await apiClient.post<Noticia>(
        `/noticias/${id}/publicar/`,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async despublicar(id: number): Promise<Noticia> {
    try {
      const { data } = await apiClient.post<Noticia>(
        `/noticias/${id}/despublicar/`,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
