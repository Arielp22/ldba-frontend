import type {
  EquipoRepository,
  ListEquiposParams,
  CreateEquipoPayload,
  UpdateEquipoPayload,
} from '@/domain/ports/equipo.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Equipo } from '@/domain/entities/equipo.entity'

export class EquipoUseCase {
  constructor(private readonly repo: EquipoRepository) {}

  list(params: ListEquiposParams): Promise<PaginatedResult<Equipo>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<Equipo> {
    return this.repo.get(id)
  }

  create(payload: CreateEquipoPayload): Promise<Equipo> {
    return this.repo.create(payload)
  }

  update(id: number, payload: UpdateEquipoPayload): Promise<Equipo> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }

  resetPassword(id: number, newPassword: string): Promise<void> {
    return this.repo.resetPassword(id, newPassword)
  }
}
