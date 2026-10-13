import { AxiosPublicoRepository } from '@/infrastructure/adapters/axios-publico.repository'
import { PublicoUseCase } from '@/application/use-cases/publico.use-case'

export const publicoUseCase = new PublicoUseCase(
  new AxiosPublicoRepository(),
)
