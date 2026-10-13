export type MovimientoTipo = 'ingreso' | 'egreso'

export interface MovimientoFinanciero {
  id: number
  tipo: MovimientoTipo
  tipo_display: string
  concepto: string
  fecha: string
  valor: string
  responsable: string | null
  comprobante: string | null
  observaciones: string | null
  created_at: string
  updated_at: string
}

export interface MovimientoResumen {
  total_ingresos: string | number
  total_egresos: string | number
  balance: string | number
  cantidad_movimientos: number
}
