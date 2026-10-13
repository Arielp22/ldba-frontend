import { AxiosEquipoRepository } from '@/infrastructure/adapters/axios-equipo.repository'
import { EquipoUseCase } from '@/application/use-cases/equipo.use-case'

export const equipoUseCase = new EquipoUseCase(new AxiosEquipoRepository())
