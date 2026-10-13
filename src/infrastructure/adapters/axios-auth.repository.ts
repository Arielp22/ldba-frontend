import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import type { AuthRepository, AuthSession } from '@/domain/ports/auth.repository'
import type { LoggedUser } from '@/domain/entities/logged-user.entity'
import type { AuthTokens } from '@/domain/entities/auth-tokens.entity'

/**
 * Forma real (plana) de la respuesta de /auth/login/.
 * El backend añade `access` y `refresh` al mismo nivel que los datos del user.
 */
interface RawAuthResponse {
  access: string
  refresh: string
  user_id: number
  username: string
  email: string
  is_staff: boolean
  is_superuser: boolean
  groups: string[]
}

/** Traduce la respuesta plana del backend a la forma anidada que usa el dominio. */
function toAuthSession(raw: RawAuthResponse): AuthSession {
  return {
    user: {
      user_id: raw.user_id,
      username: raw.username,
      email: raw.email,
      is_staff: raw.is_staff,
      is_superuser: raw.is_superuser,
      groups: raw.groups ?? [],
    },
    tokens: {
      access: raw.access,
      refresh: raw.refresh,
    },
  }
}

export class AxiosAuthRepository implements AuthRepository {
  /** POST /auth/login/ — persiste los tokens localmente si la respuesta es exitosa. */
  async login(username: string, password: string): Promise<AuthSession> {
    try {
      const { data } = await apiClient.post<RawAuthResponse>('/auth/login/', {
        username,
        password,
      })
      const session = toAuthSession(data)
      localTokenStorage.setTokens(session.tokens.access, session.tokens.refresh)
      return session
    } catch (err) {
      throw parseApiError(err)
    }
  }

  /** POST /auth/logout/ — invalida el refresh token en el servidor. */
  async logout(): Promise<void> {
    const refresh = localTokenStorage.getRefreshToken()
    if (refresh) {
      try {
        await apiClient.post('/auth/logout/', { refresh })
      } catch {
        // Si el logout falla (token ya inválido), continuar igualmente.
      }
    }
    localTokenStorage.clearTokens()
  }

  /** GET /auth/me/ — valida que el access token siga siendo válido. */
  async getCurrentUser(): Promise<LoggedUser> {
    try {
      const { data } = await apiClient.get<LoggedUser>('/auth/me/')
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  getStoredTokens(): AuthTokens | null {
    return localTokenStorage.getTokens()
  }

  clearLocalSession(): void {
    localTokenStorage.clearTokens()
  }
}
