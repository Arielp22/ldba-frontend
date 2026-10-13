export interface CreateVocaliaJugadorDto {
  vocalia: number
  jugador: number
  equipo: number
  goles?: number
  tarjeta_amarilla?: boolean
  tarjeta_roja?: boolean
  es_capitan?: boolean
  ingreso_minuto?: number | null
  salida_minuto?: number | null
}

export interface UpdateVocaliaJugadorDto {
  goles?: number
  tarjeta_amarilla?: boolean
  tarjeta_roja?: boolean
  es_capitan?: boolean
  ingreso_minuto?: number | null
  salida_minuto?: number | null
}
