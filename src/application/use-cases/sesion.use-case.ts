import type {
  SesionRepository,
  ListSesionesParams,
  CreateSesionPayload,
  UpdateSesionPayload,
} from '@/domain/ports/sesion.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Sesion } from '@/domain/entities/sesion.entity'

export class SesionUseCase {
  constructor(private readonly repo: SesionRepository) {}

  list(params: ListSesionesParams): Promise<PaginatedResult<Sesion>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<Sesion> {
    return this.repo.get(id)
  }

  create(payload: CreateSesionPayload): Promise<Sesion> {
    return this.repo.create(payload)
  }

  update(id: number, payload: UpdateSesionPayload): Promise<Sesion> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }

  finalizar(id: number): Promise<Sesion> {
    return this.repo.finalizar(id)
  }
}
