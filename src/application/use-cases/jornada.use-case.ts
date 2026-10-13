import type {
  JornadaRepository,
  ListJornadasParams,
  CreateJornadaPayload,
} from '@/domain/ports/jornada.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Jornada } from '@/domain/entities/jornada.entity'

export class JornadaUseCase {
  constructor(private readonly repo: JornadaRepository) {}

  list(params: ListJornadasParams): Promise<PaginatedResult<Jornada>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<Jornada> {
    return this.repo.get(id)
  }

  create(payload: CreateJornadaPayload): Promise<Jornada> {
    return this.repo.create(payload)
  }

  update(id: number, payload: Partial<CreateJornadaPayload>): Promise<Jornada> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }
}
