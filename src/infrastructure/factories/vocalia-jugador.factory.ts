import { AxiosVocaliaJugadorRepository } from '@/infrastructure/adapters/axios-vocalia-jugador.repository'
import { VocaliaJugadorUseCase } from '@/application/use-cases/vocalia-jugador.use-case'

export const vocaliaJugadorUseCase = new VocaliaJugadorUseCase(
  new AxiosVocaliaJugadorRepository(),
)
