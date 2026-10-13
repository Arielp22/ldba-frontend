export interface Recibo {
  id: number
  multa: number
  multa_monto: string
  multa_motivo: string
  numero: string
  entregado_a: string
  entregado_por: string
  fecha_entrega: string
  observaciones: string | null
  created_at: string
}
