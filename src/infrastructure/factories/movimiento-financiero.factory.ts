import { AxiosMovimientoFinancieroRepository } from '@/infrastructure/adapters/axios-movimiento-financiero.repository'
import { MovimientoFinancieroUseCase } from '@/application/use-cases/movimiento-financiero.use-case'

export const movimientoFinancieroUseCase = new MovimientoFinancieroUseCase(
  new AxiosMovimientoFinancieroRepository(),
)
