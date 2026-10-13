import { AxiosJornadaRepository } from '@/infrastructure/adapters/axios-jornada.repository'
import { JornadaUseCase } from '@/application/use-cases/jornada.use-case'

export const jornadaUseCase = new JornadaUseCase(
  new AxiosJornadaRepository(),
)
