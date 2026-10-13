import type {
  VocaliaJugadorRepository,
  ListVocaliaJugadoresParams,
  CreateVocaliaJugadorPayload,
  UpdateVocaliaJugadorPayload,
} from '@/domain/ports/vocalia-jugador.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { VocaliaJugador } from '@/domain/entities/vocalia-jugador.entity'

export class VocaliaJugadorUseCase {
  constructor(private readonly repo: VocaliaJugadorRepository) {}

  list(
    params: ListVocaliaJugadoresParams,
  ): Promise<PaginatedResult<VocaliaJugador>> {
    return this.repo.list(params)
  }

  create(payload: CreateVocaliaJugadorPayload): Promise<VocaliaJugador> {
    return this.repo.create(payload)
  }

  update(
    id: number,
    payload: UpdateVocaliaJugadorPayload,
  ): Promise<VocaliaJugador> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }
}
