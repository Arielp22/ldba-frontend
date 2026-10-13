import { AxiosInscripcionRepository } from '@/infrastructure/adapters/axios-inscripcion.repository'
import { InscripcionUseCase } from '@/application/use-cases/inscripcion.use-case'

export const inscripcionUseCase = new InscripcionUseCase(
  new AxiosInscripcionRepository(),
)
