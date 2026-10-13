export interface CreateMovimientoDto {
  tipo: string
  concepto: string
  fecha: string
  valor: string | number
  responsable?: string
  comprobante?: string
  observaciones?: string
}

export interface UpdateMovimientoDto {
  tipo?: string
  concepto?: string
  fecha?: string
  valor?: string | number
  responsable?: string
  comprobante?: string
  observaciones?: string
}
