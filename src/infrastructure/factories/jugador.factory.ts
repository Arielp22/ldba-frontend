import { AxiosJugadorRepository } from '@/infrastructure/adapters/axios-jugador.repository'
import { JugadorUseCase } from '@/application/use-cases/jugador.use-case'

export const jugadorUseCase = new JugadorUseCase(new AxiosJugadorRepository())
