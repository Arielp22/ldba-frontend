import type {
  DocumentoRepository,
  ListDocumentosParams,
  CreateDocumentoPayload,
  UpdateDocumentoPayload,
} from '@/domain/ports/documento.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Documento } from '@/domain/entities/documento.entity'

export class DocumentoUseCase {
  constructor(private readonly repo: DocumentoRepository) {}

  list(params: ListDocumentosParams): Promise<PaginatedResult<Documento>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<Documento> {
    return this.repo.get(id)
  }

  create(payload: CreateDocumentoPayload): Promise<Documento> {
    return this.repo.create(payload)
  }

  update(id: number, payload: UpdateDocumentoPayload): Promise<Documento> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }
}
