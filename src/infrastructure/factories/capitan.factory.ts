import { AxiosCapitanRepository } from '@/infrastructure/adapters/axios-capitan.repository'
import { CapitanUseCase } from '@/application/use-cases/capitan.use-case'

export const capitanUseCase = new CapitanUseCase(
  new AxiosCapitanRepository(),
)
