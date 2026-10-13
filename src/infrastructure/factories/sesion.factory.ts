import { AxiosSesionRepository } from '@/infrastructure/adapters/axios-sesion.repository'
import { SesionUseCase } from '@/application/use-cases/sesion.use-case'

export const sesionUseCase = new SesionUseCase(new AxiosSesionRepository())
