import type {
  SancionRepository,
  ListSancionesParams,
  CreateSancionPayload,
  UpdateSancionPayload,
  CambiarEstadoSancionPayload,
} from '@/domain/ports/sancion.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type {
  Sancion,
  HistorialSancion,
} from '@/domain/entities/sancion.entity'

export class SancionUseCase {
  constructor(private readonly repo: SancionRepository) {}

  list(params: ListSancionesParams): Promise<PaginatedResult<Sancion>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<Sancion> {
    return this.repo.get(id)
  }

  create(payload: CreateSancionPayload): Promise<Sancion> {
    return this.repo.create(payload)
  }

  update(id: number, payload: UpdateSancionPayload): Promise<Sancion> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }

  cambiarEstado(
    id: number,
    payload: CambiarEstadoSancionPayload,
  ): Promise<Sancion> {
    return this.repo.cambiarEstado(id, payload)
  }

  historial(
    sancionId: number,
  ): Promise<PaginatedResult<HistorialSancion>> {
    return this.repo.historial(sancionId)
  }
}
