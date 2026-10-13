import type {
  CategoriaRepository,
  ListCategoriasParams,
  PaginatedResult,
} from '@/domain/ports/categoria.repository'
import type { Categoria } from '@/domain/entities/categoria.entity'
import type {
  CreateCategoriaDto,
  UpdateCategoriaDto,
} from '../dtos/categoria.dto'

export class CategoriaUseCase {
  constructor(private readonly repo: CategoriaRepository) {}

  list(params: ListCategoriasParams): Promise<PaginatedResult<Categoria>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<Categoria> {
    return this.repo.get(id)
  }

  create(dto: CreateCategoriaDto): Promise<Categoria> {
    return this.repo.create(dto)
  }

  update(id: number, dto: UpdateCategoriaDto): Promise<Categoria> {
    return this.repo.update(id, dto)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }
}
