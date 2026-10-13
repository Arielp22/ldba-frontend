import type {
  SesionParticipanteRepository,
  ListSesionParticipantesParams,
  CreateSesionParticipantePayload,
  UpdateSesionParticipantePayload,
} from '@/domain/ports/sesion-participante.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { SesionParticipante } from '@/domain/entities/sesion-participante.entity'

export class SesionParticipanteUseCase {
  constructor(private readonly repo: SesionParticipanteRepository) {}

  list(
    params: ListSesionParticipantesParams,
  ): Promise<PaginatedResult<SesionParticipante>> {
    return this.repo.list(params)
  }

  create(
    payload: CreateSesionParticipantePayload,
  ): Promise<SesionParticipante> {
    return this.repo.create(payload)
  }

  update(
    id: number,
    payload: UpdateSesionParticipantePayload,
  ): Promise<SesionParticipante> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }
}
