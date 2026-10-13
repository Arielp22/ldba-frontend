import type {
  MultaRepository,
  ListMultasParams,
  CreateMultaPayload,
  UpdateMultaPayload,
  MarcarPagadaPayload,
} from '@/domain/ports/multa.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Multa } from '@/domain/entities/multa.entity'

export class MultaUseCase {
  constructor(private readonly repo: MultaRepository) {}

  list(params: ListMultasParams): Promise<PaginatedResult<Multa>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<Multa> {
    return this.repo.get(id)
  }

  create(payload: CreateMultaPayload): Promise<Multa> {
    return this.repo.create(payload)
  }

  update(id: number, payload: UpdateMultaPayload): Promise<Multa> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }

  marcarPagada(id: number, payload: MarcarPagadaPayload): Promise<Multa> {
    return this.repo.marcarPagada(id, payload)
  }
}
