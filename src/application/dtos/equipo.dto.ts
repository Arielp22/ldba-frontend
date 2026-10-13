export interface CreateEquipoDto {
  nombre: string
  siglas?: string
  color_principal?: string
  color_secundario?: string
  presidente?: string
  telefono?: string
  email?: string
  activo?: boolean
  username: string
  password: string
}

export interface UpdateEquipoDto {
  nombre?: string
  siglas?: string
  color_principal?: string
  color_secundario?: string
  presidente?: string
  telefono?: string
  email?: string
  activo?: boolean
}

export interface ResetPasswordEquipoDto {
  new_password: string
  new_password2: string
}
