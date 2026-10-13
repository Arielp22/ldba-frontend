import { create } from 'zustand'
import { authUseCase } from '@/infrastructure/factories/auth.factory'
import { AUTH_EXPIRED_EVENT } from '@/infrastructure/http/axios-client'
import type { LoggedUser } from '@/domain/entities/logged-user.entity'
import type { AuthTokens } from '@/domain/entities/auth-tokens.entity'

// ─── Tipos del store ──────────────────────────────────────────────────────────

interface AuthState {
  /** Usuario autenticado, o null si no hay sesión activa. */
  user: LoggedUser | null
  /** Tokens JWT actuales, o null si no hay sesión. */
  tokens: AuthTokens | null
  /** true mientras hay una operación de red en curso (login, logout). */
  isLoading: boolean
  /** Mensaje de error del último intento fallido, null si no hay error. */
  error: string | null
}

interface AuthActions {
  /** Actualiza tokens + user manualmente (usado al editar perfil). */
  setTokens(access: string, refresh: string, user: LoggedUser): void
  /** Inicia sesión con username y password. */
  login(username: string, password: string): Promise<void>
  /** Cierra la sesión: invalida el token en el servidor y limpia el estado. */
  logout(): Promise<void>
  /**
   * Restaura la sesión a partir de los tokens guardados.
   * Debe llamarse al montar la app (useEffect en AppRouter).
   */
  loadSession(): Promise<void>
  /** Limpia el error actual. */
  clearError(): void
  /** Limpia el estado de sesión sin llamar al servidor (usado por authExpired). */
  _clearSession(): void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState & AuthActions>((set, get) => {
  // Suscribirse al evento authExpired que dispara el interceptor de Axios
  // cuando el refresh token ya no es válido.
  if (typeof window !== 'undefined') {
    window.addEventListener(AUTH_EXPIRED_EVENT, () => {
      get()._clearSession()
    })
  }

  return {
    // ── Estado inicial ──────────────────────────────────────────────────────
    user: null,
    tokens: null,
    isLoading: false,
    error: null,

    // ── Acciones ────────────────────────────────────────────────────────────

    setTokens(access, refresh, user) {
      set({ tokens: { access, refresh }, user })
    },

    async login(username, password) {
      set({ isLoading: true, error: null })
      try {
        const { user, tokens } = await authUseCase.login({ username, password })
        set({ user, tokens, isLoading: false })
      } catch (err: unknown) {
        const apiErr = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: apiErr.detail ?? apiErr.message ?? 'Error al iniciar sesión',
        })
        throw err
      }
    },

    async logout() {
      set({ isLoading: true })
      await authUseCase.logout()
      set({ user: null, tokens: null, isLoading: false, error: null })
    },

    async loadSession() {
      set({ isLoading: true })
      const session = await authUseCase.restoreSession()
      if (session) {
        set({ user: session.user, tokens: session.tokens, isLoading: false })
      } else {
        set({ user: null, tokens: null, isLoading: false })
      }
    },

    clearError() {
      set({ error: null })
    },

    _clearSession() {
      authUseCase.clearLocalSession()
      set({ user: null, tokens: null, isLoading: false, error: null })
    },
  }
})

// ─── Selectores de conveniencia ───────────────────────────────────────────────

/** true si hay un usuario autenticado. */
export const selectIsAuthenticated = (state: AuthState) => state.user !== null

/** true si el usuario es staff o superusuario. */
export const selectIsStaff = (state: AuthState) =>
  state.user?.is_staff === true || state.user?.is_superuser === true

/**
 * Verifica si el usuario pertenece a un grupo/comisión.
 * Un superusuario siempre tiene acceso.
 */
export function selectHasGroup(state: AuthState, groupName: string): boolean {
  const user = state.user
  if (!user) return false
  if (user.is_superuser) return true
  return user.groups.includes(groupName)
}