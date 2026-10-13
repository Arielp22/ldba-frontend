import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  UserAdminRepository,
  ListUsersParams,
} from '@/domain/ports/user-admin.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type {
  UserAdmin,
  UserAdminStats,
} from '@/domain/entities/user-admin.entity'

export class AxiosUserAdminRepository implements UserAdminRepository {
  async list(params: ListUsersParams): Promise<PaginatedResult<UserAdmin>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<UserAdmin>>(
        '/users/',
        {
          params: {
            page: params.page ?? 1,
            page_size: params.pageSize ?? 10,
            search: params.search || undefined,
            is_staff: params.is_staff,
            is_active: params.is_active,
          },
        },
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async get(id: number): Promise<UserAdmin> {
    try {
      const { data } = await apiClient.get<UserAdmin>(`/users/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async toggleActive(id: number): Promise<UserAdmin> {
    try {
      const { data } = await apiClient.post<UserAdmin>(
        `/users/${id}/toggle-active/`,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async stats(): Promise<UserAdminStats> {
    try {
      const { data } = await apiClient.get<UserAdminStats>('/users/stats/')
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
