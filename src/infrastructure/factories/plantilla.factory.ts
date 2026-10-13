import { AxiosPlantillaRepository } from '@/infrastructure/adapters/axios-plantilla.repository'
import { PlantillaUseCase } from '@/application/use-cases/plantilla.use-case'

export const plantillaUseCase = new PlantillaUseCase(
  new AxiosPlantillaRepository(),
)
