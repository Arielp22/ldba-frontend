import type {
  PlantillaRepository,
  ListPlantillasParams,
  CreatePlantillaPayload,
} from '@/domain/ports/plantilla.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Plantilla } from '@/domain/entities/plantilla.entity'

export class PlantillaUseCase {
  constructor(private readonly repo: PlantillaRepository) {}

  list(params: ListPlantillasParams): Promise<PaginatedResult<Plantilla>> {
    return this.repo.list(params)
  }

  create(payload: CreatePlantillaPayload): Promise<Plantilla> {
    return this.repo.create(payload)
  }

  update(
    id: number,
    payload: Partial<CreatePlantillaPayload>,
  ): Promise<Plantilla> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }
}
