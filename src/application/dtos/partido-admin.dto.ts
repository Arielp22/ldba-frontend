export interface CreatePartidoDto {
  jornada: number
  numero_partido: number
  dia: string
  hora?: string
  equipo_local: number
  equipo_visitante: number
  equipo_vocal?: number
  estado?: string
  observaciones?: string
}

export interface UpdatePartidoDto {
  numero_partido?: number
  dia?: string
  hora?: string
  equipo_local?: number
  equipo_visitante?: number
  equipo_vocal?: number | null
  estado?: string
  observaciones?: string
}

export interface RegistrarResultadoDto {
  goles_local: number
  goles_visitante: number
  observaciones?: string
}
