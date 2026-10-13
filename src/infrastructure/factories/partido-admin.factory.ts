import { AxiosPartidoAdminRepository } from '@/infrastructure/adapters/axios-partido-admin.repository'
import { PartidoAdminUseCase } from '@/application/use-cases/partido-admin.use-case'

export const partidoAdminUseCase = new PartidoAdminUseCase(
  new AxiosPartidoAdminRepository(),
)
