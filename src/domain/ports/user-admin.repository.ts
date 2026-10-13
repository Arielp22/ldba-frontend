import type {
  UserAdmin,
  UserAdminStats,
} from '../entities/user-admin.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListUsersParams {
  page?: number
  pageSize?: number
  search?: string
  is_staff?: boolean
  is_active?: boolean
}

export interface UserAdminRepository {
  list(params: ListUsersParams): Promise<PaginatedResult<UserAdmin>>
  get(id: number): Promise<UserAdmin>
  toggleActive(id: number): Promise<UserAdmin>
  stats(): Promise<UserAdminStats>
}
