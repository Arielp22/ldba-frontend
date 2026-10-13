import { AxiosCategoriaRepository } from '@/infrastructure/adapters/axios-categoria.repository'
import { CategoriaUseCase } from '@/application/use-cases/categoria.use-case'

export const categoriaUseCase = new CategoriaUseCase(
  new AxiosCategoriaRepository(),
)
