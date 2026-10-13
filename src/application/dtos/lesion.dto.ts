export interface CreateLesionDto {
  jugador: number
  equipo?: number | null
  partido?: number | null
  vocalia?: number | null
  fecha: string
  tipo: string
  gravedad?: string
  descripcion?: string
  monto_apoyo?: string | number | null
  estado?: string
  observaciones?: string
}

export interface UpdateLesionDto {
  fecha?: string
  tipo?: string
  gravedad?: string
  descripcion?: string
  monto_apoyo?: string | number | null
  observaciones?: string
}

export interface CambiarEstadoLesionDto {
  estado: string
  monto_apoyo?: string | number | null
  observaciones?: string
}
