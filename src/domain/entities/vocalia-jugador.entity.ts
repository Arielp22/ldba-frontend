export interface VocaliaJugador {
  id: number
  vocalia: number
  jugador: number
  jugador_nombre: string
  equipo: number
  equipo_nombre: string
  goles: number
  tarjeta_amarilla: boolean
  tarjeta_roja: boolean
  es_capitan: boolean
  ingreso_minuto: number | null
  salida_minuto: number | null
  created_at: string
}
