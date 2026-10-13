import { AxiosUserAdminRepository } from '@/infrastructure/adapters/axios-user-admin.repository'
import { UserAdminUseCase } from '@/application/use-cases/user-admin.use-case'

export const userAdminUseCase = new UserAdminUseCase(
  new AxiosUserAdminRepository(),
)
