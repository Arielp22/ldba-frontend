import { AxiosReciboRepository } from '@/infrastructure/adapters/axios-recibo.repository'
import { ReciboUseCase } from '@/application/use-cases/recibo.use-case'

export const reciboUseCase = new ReciboUseCase(new AxiosReciboRepository())
