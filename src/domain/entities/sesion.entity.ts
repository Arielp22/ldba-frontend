export type SesionTipo = 'ordinaria' | 'extraordinaria'
export type SesionEstado =
  | 'programada'
  | 'en_curso'
  | 'finalizada'
  | 'cancelada'

export interface Sesion {
  id: number
  fecha: string
  tipo: SesionTipo
  tipo_display: string
  orden_del_dia: string | null
  acta: string | null
  estado: SesionEstado
  estado_display: string
  observaciones: string | null
  participantes_count: number
  created_at: string
  updated_at: string
}
