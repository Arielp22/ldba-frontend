import type {
  UserAdminRepository,
  ListUsersParams,
} from '@/domain/ports/user-admin.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type {
  UserAdmin,
  UserAdminStats,
} from '@/domain/entities/user-admin.entity'
import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type {
  ChangePasswordDto,
  UpdateProfileDto,
} from '../dtos/user-admin.dto'

export class UserAdminUseCase {
  constructor(private readonly repo: UserAdminRepository) {}

  list(params: ListUsersParams): Promise<PaginatedResult<UserAdmin>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<UserAdmin> {
    return this.repo.get(id)
  }

  toggleActive(id: number): Promise<UserAdmin> {
    return this.repo.toggleActive(id)
  }

  stats(): Promise<UserAdminStats> {
    return this.repo.stats()
  }

  /** Actualiza el perfil propio (no es admin-only). */
  async updateProfile(dto: UpdateProfileDto): Promise<UserAdmin> {
    try {
      const { data } = await apiClient.patch<UserAdmin>('/users/profile/', dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  /** Cambia la contraseña del usuario autenticado. */
  async changePassword(dto: ChangePasswordDto): Promise<{ message: string }> {
    try {
      const { data } = await apiClient.post<{ message: string }>(
        '/users/change-password/',
        dto,
      )
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
