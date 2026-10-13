import type {
  ReciboRepository,
  ListRecibosParams,
  CreateReciboPayload,
  UpdateReciboPayload,
} from '@/domain/ports/recibo.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Recibo } from '@/domain/entities/recibo.entity'

export class ReciboUseCase {
  constructor(private readonly repo: ReciboRepository) {}

  list(params: ListRecibosParams): Promise<PaginatedResult<Recibo>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<Recibo> {
    return this.repo.get(id)
  }

  create(payload: CreateReciboPayload): Promise<Recibo> {
    return this.repo.create(payload)
  }

  update(id: number, payload: UpdateReciboPayload): Promise<Recibo> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }
}
