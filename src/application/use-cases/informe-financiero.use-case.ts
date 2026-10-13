import type {
  InformeFinancieroRepository,
  ListInformesParams,
  CreateInformePayload,
  UpdateInformePayload,
} from '@/domain/ports/informe-financiero.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { InformeFinancieroSemanal } from '@/domain/entities/informe-financiero.entity'

export class InformeFinancieroUseCase {
  constructor(private readonly repo: InformeFinancieroRepository) {}

  list(
    params: ListInformesParams,
  ): Promise<PaginatedResult<InformeFinancieroSemanal>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<InformeFinancieroSemanal> {
    return this.repo.get(id)
  }

  create(payload: CreateInformePayload): Promise<InformeFinancieroSemanal> {
    return this.repo.create(payload)
  }

  update(
    id: number,
    payload: UpdateInformePayload,
  ): Promise<InformeFinancieroSemanal> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }
}
