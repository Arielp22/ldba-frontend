export interface CreateMultaDto {
  sancion?: number | null
  equipo?: number | null
  monto: string | number
  motivo: string
  estado?: string
  fecha_pago?: string | null
  forma_pago?: string | null
  observaciones?: string
}

export interface UpdateMultaDto {
  monto?: string | number
  motivo?: string
  estado?: string
  fecha_pago?: string | null
  forma_pago?: string | null
  observaciones?: string
}

export interface MarcarPagadaDto {
  fecha_pago: string
  forma_pago: string
}
