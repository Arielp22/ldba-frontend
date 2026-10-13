export interface UserAdmin {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_active: boolean
  date_joined: string
}

export interface UserAdminStats {
  total: number
  active: number
  inactive: number
  staff: number
}
