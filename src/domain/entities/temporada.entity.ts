export type TemporadaEstado =
  | 'planificada'
  | 'en_curso'
  | 'finalizada'
  | 'cancelada'

export interface Temporada {
  id: number
  nombre: string
  anio: number
  fecha_inicio: string
  fecha_fin: string
  estado: TemporadaEstado
  created_at: string
  updated_at: string
}
