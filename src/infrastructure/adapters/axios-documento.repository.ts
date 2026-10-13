import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  DocumentoRepository,
  ListDocumentosParams,
  CreateDocumentoPayload,
  UpdateDocumentoPayload,
} from '@/domain/ports/documento.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Documento } from '@/domain/entities/documento.entity'

export class AxiosDocumentoRepository implements DocumentoRepository {
  async list(params: ListDocumentosParams): Promise<PaginatedResult<Documento>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Documento>>(
        '/documentos/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            search: params.search || undefined,
            tipo: params.tipo,
            jugador: params.jugador,
            equipo: params.equipo,
            sesion: params.sesion,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<Documento> {
    try {
      const { data } = await apiClient.get<Documento>(`/documentos/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateDocumentoPayload): Promise<Documento> {
    try {
      const { data } = await apiClient.post<Documento>('/documentos/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: UpdateDocumentoPayload): Promise<Documento> {
    try {
      const { data } = await apiClient.patch<Documento>(
        `/documentos/${id}/`,
        payload,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await apiClient.delete(`/documentos/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
