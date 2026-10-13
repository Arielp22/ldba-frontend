import { AxiosTemporadaRepository } from '@/infrastructure/adapters/axios-temporada.repository'
import { TemporadaUseCase } from '@/application/use-cases/temporada.use-case'

export const temporadaUseCase = new TemporadaUseCase(
  new AxiosTemporadaRepository(),
)
