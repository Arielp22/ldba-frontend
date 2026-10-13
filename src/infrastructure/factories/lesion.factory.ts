import { AxiosLesionRepository } from '@/infrastructure/adapters/axios-lesion.repository'
import { LesionUseCase } from '@/application/use-cases/lesion.use-case'

export const lesionUseCase = new LesionUseCase(new AxiosLesionRepository())
