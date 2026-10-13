export type InformeEstado = 'borrador' | 'presentado' | 'aprobado'

export interface InformeFinancieroSemanal {
  id: number
  numero_semana: number
  anio: number
  fecha_semana: string
  cerveza: string
  boleteria: string
  multas: string
  otros_ingresos: string
  egresos: string
  total_ingresos: string
  balance: string
  estado: InformeEstado
  estado_display: string
  observaciones: string | null
  created_at: string
  updated_at: string
}
