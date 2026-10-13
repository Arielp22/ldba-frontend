import type {
  InscripcionRepository,
  ListInscripcionesParams,
  CreateInscripcionPayload,
} from '@/domain/ports/inscripcion.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Inscripcion } from '@/domain/entities/inscripcion.entity'

export class InscripcionUseCase {
  constructor(private readonly repo: InscripcionRepository) {}

  list(params: ListInscripcionesParams): Promise<PaginatedResult<Inscripcion>> {
    return this.repo.list(params)
  }

  create(payload: CreateInscripcionPayload): Promise<Inscripcion> {
    return this.repo.create(payload)
  }

  update(id: number, payload: Partial<CreateInscripcionPayload>): Promise<Inscripcion> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }
}
