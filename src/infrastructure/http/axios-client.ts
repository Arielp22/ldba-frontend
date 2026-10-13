import axios, { type AxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/infrastructure/config/api.config'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import { ApiException } from '@/domain/exceptions/api.exception'
import { parseApiError } from './parse-api-error'

/**
 * Evento personalizado que se dispara en window cuando la sesión expira
 * de forma irrecuperable (refresh token inválido o caducado).
 */
export const AUTH_EXPIRED_EVENT = 'authExpired'

/** Tipo del detalle del evento authExpired. */
export interface AuthExpiredEventDetail {
  reason: string
}

// ─── Instancia Axios ─────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    const token = localTokenStorage.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(parseApiError(error)),
)

// ─── Response interceptor ────────────────────────────────────────────────────

/** Flag para evitar múltiples intentos de refresh simultáneos. */
let isRefreshing = false

/** Cola de callbacks que esperan el nuevo access token. */
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function notifySubscribers(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

function dispatchAuthExpired(reason: string) {
  const event = new CustomEvent<AuthExpiredEventDetail>(AUTH_EXPIRED_EVENT, {
    detail: { reason },
  })
  window.dispatchEvent(event)
}

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Solo intentar refresh en 401 y si no es ya un reintento
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(parseApiError(error))
    }

    originalRequest._retry = true

    const refreshToken = localTokenStorage.getRefreshToken()
    if (!refreshToken) {
      localTokenStorage.clearTokens()
      dispatchAuthExpired('No refresh token available')
      return Promise.reject(
        new ApiException(401, 'Sesión expirada. Por favor inicia sesión de nuevo.'),
      )
    }

    if (isRefreshing) {
      // Ya hay un refresh en curso: encolar esta petición
      return new Promise<string>((resolve) => {
        subscribeTokenRefresh(resolve)
      }).then((newToken) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }
        return apiClient(originalRequest)
      })
    }

    isRefreshing = true

    try {
      const { data } = await axios.post<{ access: string }>(
        `${API_CONFIG.BASE_URL}/auth/token/refresh/`,
        { refresh: refreshToken },
        { timeout: API_CONFIG.TIMEOUT },
      )

      const newAccessToken = data.access

      localTokenStorage.setTokens(newAccessToken, refreshToken)
      notifySubscribers(newAccessToken)

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      }

      return apiClient(originalRequest)
    } catch {
      localTokenStorage.clearTokens()
      refreshSubscribers = []
      dispatchAuthExpired('Refresh token invalid or expired')

      return Promise.reject(
        new ApiException(401, 'Tu sesión ha expirado. Por favor inicia sesión de nuevo.'),
      )
    } finally {
      isRefreshing = false
    }
  },
)
