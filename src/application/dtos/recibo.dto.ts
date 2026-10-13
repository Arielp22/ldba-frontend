export interface CreateReciboDto {
  multa: number
  numero: string
  entregado_a: string
  entregado_por: string
  fecha_entrega: string
  observaciones?: string
}

export interface UpdateReciboDto {
  numero?: string
  entregado_a?: string
  entregado_por?: string
  fecha_entrega?: string
  observaciones?: string
}
