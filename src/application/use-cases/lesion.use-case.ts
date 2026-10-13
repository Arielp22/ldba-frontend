import type {
  LesionRepository,
  ListLesionesParams,
  CreateLesionPayload,
  UpdateLesionPayload,
  CambiarEstadoLesionPayload,
} from '@/domain/ports/lesion.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Lesion } from '@/domain/entities/lesion.entity'

export class LesionUseCase {
  constructor(private readonly repo: LesionRepository) {}

  list(params: ListLesionesParams): Promise<PaginatedResult<Lesion>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<Lesion> {
    return this.repo.get(id)
  }

  create(payload: CreateLesionPayload): Promise<Lesion> {
    return this.repo.create(payload)
  }

  update(id: number, payload: UpdateLesionPayload): Promise<Lesion> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }

  cambiarEstado(
    id: number,
    payload: CambiarEstadoLesionPayload,
  ): Promise<Lesion> {
    return this.repo.cambiarEstado(id, payload)
  }
}
