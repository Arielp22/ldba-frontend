import { AxiosVocaliaRepository } from '@/infrastructure/adapters/axios-vocalia.repository'
import { VocaliaUseCase } from '@/application/use-cases/vocalia.use-case'

export const vocaliaUseCase = new VocaliaUseCase(
  new AxiosVocaliaRepository(),
)
