export interface ChangePasswordDto {
  current_password: string
  new_password: string
  new_password2: string
}

export interface UpdateProfileDto {
  first_name?: string
  last_name?: string
  email?: string
}
