export interface Equipo {
  id: number
  nombre: string
  siglas: string | null
  color_principal: string | null
  color_secundario: string | null
  logo: string | null
  presidente: string | null
  telefono: string | null
  email: string | null
  activo: boolean
  user_id: number
  username: string
  created_at: string
  updated_at: string
}
