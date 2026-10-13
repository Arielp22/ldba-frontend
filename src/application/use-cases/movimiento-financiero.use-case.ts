import type {
  MovimientoFinancieroRepository,
  ListMovimientosParams,
  CreateMovimientoPayload,
  UpdateMovimientoPayload,
} from '@/domain/ports/movimiento-financiero.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type {
  MovimientoFinanciero,
  MovimientoResumen,
} from '@/domain/entities/movimiento-financiero.entity'

export class MovimientoFinancieroUseCase {
  constructor(private readonly repo: MovimientoFinancieroRepository) {}

  list(
    params: ListMovimientosParams,
  ): Promise<PaginatedResult<MovimientoFinanciero>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<MovimientoFinanciero> {
    return this.repo.get(id)
  }

  create(payload: CreateMovimientoPayload): Promise<MovimientoFinanciero> {
    return this.repo.create(payload)
  }

  update(
    id: number,
    payload: UpdateMovimientoPayload,
  ): Promise<MovimientoFinanciero> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }

  resumen(params?: ListMovimientosParams): Promise<MovimientoResumen> {
    return this.repo.resumen(params)
  }
}
