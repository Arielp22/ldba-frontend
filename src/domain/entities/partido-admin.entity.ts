export type PartidoDia = 'sabado' | 'domingo'
export type PartidoEstado =
  | 'programado'
  | 'en_curso'
  | 'finalizado'
  | 'suspendido'
  | 'cancelado'

export interface PartidoAdmin {
  id: number
  jornada: number
  jornada_numero: number
  temporada_nombre: string
  categoria_nombre: string
  numero_partido: number
  dia: PartidoDia
  dia_display: string
  hora: string | null
  equipo_local: number
  equipo_local_nombre: string
  equipo_visitante: number
  equipo_visitante_nombre: string
  equipo_vocal: number | null
  equipo_vocal_nombre: string | null
  goles_local: number | null
  goles_visitante: number | null
  estado: PartidoEstado
  estado_display: string
  observaciones: string | null
  created_at: string
  updated_at: string
}

export interface AsignacionVocalia {
  dia: string
  partido: number
  vocaliza_partido?: number
  equipo_vocal?: string
  equipo_vocal_id?: number
  error?: string
}

export interface SorteoVocaliasResponse {
  jornada: number
  asignaciones: AsignacionVocalia[]
}
