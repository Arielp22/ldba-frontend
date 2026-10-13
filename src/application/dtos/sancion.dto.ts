export interface CreateSancionDto {
  tipo: string
  jugador?: number | null
  equipo?: number | null
  partido?: number | null
  vocalia?: number | null
  motivo: string
  articulo?: string
  fecha_inicio: string
  fecha_fin?: string | null
  dias?: number
  partidos_sancion?: number
  estado?: string
  observaciones?: string
}

export interface UpdateSancionDto {
  motivo?: string
  articulo?: string
  fecha_inicio?: string
  fecha_fin?: string | null
  dias?: number
  partidos_sancion?: number
  observaciones?: string
}

export interface CambiarEstadoSancionDto {
  estado: string
  motivo_cambio?: string
}
