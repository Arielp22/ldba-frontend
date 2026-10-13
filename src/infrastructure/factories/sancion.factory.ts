import { AxiosSancionRepository } from '@/infrastructure/adapters/axios-sancion.repository'
import { SancionUseCase } from '@/application/use-cases/sancion.use-case'

export const sancionUseCase = new SancionUseCase(
  new AxiosSancionRepository(),
)
