export type JugadorEstadoCalificacion =
  | 'pendiente'
  | 'calificado'
  | 'rechazado'
  | 'inhabilitado'

export interface Jugador {
  id: number
  nombres: string
  apellidos: string
  nombre_completo: string
  cedula: string
  fecha_nacimiento: string
  telefono: string | null
  email: string | null
  direccion: string | null
  foto: string | null
  numero_carnet: string | null
  estado_calificacion: JugadorEstadoCalificacion
  observaciones: string | null
  activo: boolean
  created_at: string
  updated_at: string
}
