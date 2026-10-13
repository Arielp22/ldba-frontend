import type { LoggedUser } from '../entities/logged-user.entity'
import type { AuthTokens } from '../entities/auth-tokens.entity'

/** Resultado de un login exitoso. */
export interface AuthSession {
  user: LoggedUser
  tokens: AuthTokens
}

/**
 * Contrato de acceso a datos de autenticación.
 * Implementado por infrastructure/adapters/axios-auth.repository.ts
 */
export interface AuthRepository {
  login(username: string, password: string): Promise<AuthSession>
  /** Invalida el refresh token en el servidor y limpia los tokens locales. */
  logout(): Promise<void>
  /** Valida la sesión actual contra el servidor. Lanza ApiException si el token no es válido. */
  getCurrentUser(): Promise<LoggedUser>
  /** Lee los tokens persistidos localmente, sin llamar al servidor. */
  getStoredTokens(): AuthTokens | null
  /** Limpia los tokens locales sin llamar al servidor. */
  clearLocalSession(): void
}
