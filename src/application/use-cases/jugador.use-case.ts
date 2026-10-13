import type {
  JugadorRepository,
  ListJugadoresParams,
  CreateJugadorPayload,
  UpdateJugadorPayload,
  CalificarJugadorPayload,
} from '@/domain/ports/jugador.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Jugador } from '@/domain/entities/jugador.entity'
import type {
  ImportJugadoresResult,
} from '@/domain/ports/jugador.repository'


export class JugadorUseCase {
  constructor(private readonly repo: JugadorRepository) { }

  list(params: ListJugadoresParams): Promise<PaginatedResult<Jugador>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<Jugador> {
    return this.repo.get(id)
  }

  create(payload: CreateJugadorPayload): Promise<Jugador> {
    return this.repo.create(payload)
  }

  update(id: number, payload: UpdateJugadorPayload): Promise<Jugador> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }

  calificar(id: number, payload: CalificarJugadorPayload): Promise<Jugador> {
    return this.repo.calificar(id, payload)
  }

  importarExcel(file: File): Promise<ImportJugadoresResult> {
    return this.repo.importarExcel(file)
  }
}
