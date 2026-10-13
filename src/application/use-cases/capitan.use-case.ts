import type {
  CapitanRepository,
  ListCapitanesParams,
  CreateCapitanPayload,
} from '@/domain/ports/capitan.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Capitan } from '@/domain/entities/capitan.entity'

export class CapitanUseCase {
  constructor(private readonly repo: CapitanRepository) {}

  list(params: ListCapitanesParams): Promise<PaginatedResult<Capitan>> {
    return this.repo.list(params)
  }

  create(payload: CreateCapitanPayload): Promise<Capitan> {
    return this.repo.create(payload)
  }

  update(
    id: number,
    payload: Partial<CreateCapitanPayload>,
  ): Promise<Capitan> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }
}
