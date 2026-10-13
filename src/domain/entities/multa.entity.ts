export type MultaEstado = 'pendiente' | 'pagada' | 'condonada'
export type MultaFormaPago =
  | 'efectivo'
  | 'transferencia'
  | 'deposito'
  | 'otro'

export interface Multa {
  id: number
  sancion: number | null
  equipo: number | null
  equipo_nombre: string | null
  monto: string
  motivo: string
  estado: MultaEstado
  estado_display: string
  fecha_pago: string | null
  forma_pago: MultaFormaPago | null
  forma_pago_display: string | null
  observaciones: string | null
  created_at: string
  updated_at: string
}
