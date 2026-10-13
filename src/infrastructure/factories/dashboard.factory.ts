import { AxiosDashboardRepository } from '@/infrastructure/adapters/axios-dashboard.repository'
import { DashboardUseCase } from '@/application/use-cases/dashboard.use-case'

export const dashboardUseCase = new DashboardUseCase(
  new AxiosDashboardRepository(),
)
