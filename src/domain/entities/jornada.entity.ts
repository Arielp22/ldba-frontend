export type JornadaEstado =
  | 'planificada'
  | 'en_curso'
  | 'finalizada'
  | 'cancelada'

export interface Jornada {
  id: number
  temporada: number
  temporada_nombre: string
  categoria: number
  categoria_nombre: string
  numero: number
  fecha_sabado: string
  fecha_domingo: string
  estado: JornadaEstado
  partidos_count: number
  created_at: string
  updated_at: string
}
