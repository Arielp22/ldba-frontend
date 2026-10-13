import type {
  TemporadaRepository,
  ListTemporadasParams,
} from '@/domain/ports/temporada.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Temporada } from '@/domain/entities/temporada.entity'
import type {
  CreateTemporadaDto,
  UpdateTemporadaDto,
} from '../dtos/temporada.dto'

export class TemporadaUseCase {
  constructor(private readonly repo: TemporadaRepository) {}

  list(params: ListTemporadasParams): Promise<PaginatedResult<Temporada>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<Temporada> {
    return this.repo.get(id)
  }

  create(dto: CreateTemporadaDto): Promise<Temporada> {
    return this.repo.create(dto)
  }

  update(id: number, dto: UpdateTemporadaDto): Promise<Temporada> {
    return this.repo.update(id, dto)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }
}
