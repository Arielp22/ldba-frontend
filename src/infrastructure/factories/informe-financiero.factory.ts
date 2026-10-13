import { AxiosInformeFinancieroRepository } from '@/infrastructure/adapters/axios-informe-financiero.repository'
import { InformeFinancieroUseCase } from '@/application/use-cases/informe-financiero.use-case'

export const informeFinancieroUseCase = new InformeFinancieroUseCase(
  new AxiosInformeFinancieroRepository(),
)
