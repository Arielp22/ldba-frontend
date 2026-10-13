import { AxiosAuthRepository } from '@/infrastructure/adapters/axios-auth.repository'
import { AuthUseCase } from '@/application/use-cases/auth.use-case'

/**
 * Instancia única del caso de uso de autenticación, ya conectada a su
 * implementación concreta (AxiosAuthRepository).
 *
 * El resto de la app importa `authUseCase` y nunca instancia AuthUseCase
 * ni AxiosAuthRepository directamente.
 */
export const authUseCase = new AuthUseCase(new AxiosAuthRepository())
