export type VocaliaEstado =
  | 'borrador'
  | 'enviada'
  | 'aprobada'
  | 'rechazada'

export interface PartidoInfo {
  id: number
  dia: string
  numero_partido: number
  hora: string | null
  equipo_local: string
  equipo_visitante: string
  jornada_numero: number
}

export interface Vocalia {
  id: number
  partido: number | null
  partido_info: PartidoInfo | null
  arbitro: string
  vocal: string
  goles_local: number | null
  goles_visitante: number | null
  informe: string | null
  firma_arbitro: string | null
  firma_vocal: string | null
  estado: VocaliaEstado
  estado_display: string
  observaciones_rechazo: string | null
  created_at: string
  updated_at: string
}
