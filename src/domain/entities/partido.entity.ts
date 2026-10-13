/** Equipo minimalista (solo lo necesario para el dashboard). */
export interface EquipoMini {
  id: number
  nombre: string
  siglas: string | null
  color_principal: string | null
  logo: string | null
}

/** Partido tal como lo devuelve /publico/partidos/. */
export interface Partido {
  id: number
  jornada: number
  jornada_numero: number
  temporada: number
  temporada_nombre: string
  categoria: number
  categoria_nombre: string
  dia: 'sabado' | 'domingo'
  dia_display: string
  numero_partido: number
  hora: string | null
  equipo_local: EquipoMini
  equipo_visitante: EquipoMini
  equipo_vocal: EquipoMini | null
  goles_local: number | null
  goles_visitante: number | null
  estado: 'programado' | 'en_curso' | 'finalizado' | 'suspendido' | 'cancelado'
  estado_display: string
}
