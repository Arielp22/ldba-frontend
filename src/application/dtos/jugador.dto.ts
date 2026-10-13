export interface CreateJugadorDto {
  nombres: string
  apellidos: string
  cedula: string
  fecha_nacimiento: string
  telefono?: string
  email?: string
  direccion?: string
  numero_carnet?: string
  estado_calificacion?: string
  observaciones?: string
  activo?: boolean
}

export interface UpdateJugadorDto {
  nombres?: string
  apellidos?: string
  cedula?: string
  fecha_nacimiento?: string
  telefono?: string
  email?: string
  direccion?: string
  numero_carnet?: string
  observaciones?: string
  activo?: boolean
}

export interface CalificarJugadorDto {
  estado_calificacion: string
  observaciones?: string
}
