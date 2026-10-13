import type {
  NoticiaRepository,
  ListNoticiasParams,
  CreateNoticiaPayload,
  UpdateNoticiaPayload,
} from '@/domain/ports/noticia.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Noticia } from '@/domain/entities/noticia.entity'

export class NoticiaUseCase {
  constructor(private readonly repo: NoticiaRepository) {}

  list(params: ListNoticiasParams): Promise<PaginatedResult<Noticia>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<Noticia> {
    return this.repo.get(id)
  }

  create(payload: CreateNoticiaPayload): Promise<Noticia> {
    return this.repo.create(payload)
  }

  update(id: number, payload: UpdateNoticiaPayload): Promise<Noticia> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }

  publicar(id: number): Promise<Noticia> {
    return this.repo.publicar(id)
  }

  despublicar(id: number): Promise<Noticia> {
    return this.repo.despublicar(id)
  }
}
