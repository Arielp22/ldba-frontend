import { AxiosMultaRepository } from '@/infrastructure/adapters/axios-multa.repository'
import { MultaUseCase } from '@/application/use-cases/multa.use-case'

export const multaUseCase = new MultaUseCase(new AxiosMultaRepository())
