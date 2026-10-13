import { AxiosSesionParticipanteRepository } from '@/infrastructure/adapters/axios-sesion-participante.repository'
import { SesionParticipanteUseCase } from '@/application/use-cases/sesion-participante.use-case'

export const sesionParticipanteUseCase = new SesionParticipanteUseCase(
  new AxiosSesionParticipanteRepository(),
)
