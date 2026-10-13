export type SancionTipo = 'jugador' | 'equipo'
export type SancionEstado = 'activa' | 'cumplida' | 'apelada' | 'anulada'

export interface Sancion {
  id: number
  tipo: SancionTipo
  tipo_display: string
  jugador: number | null
  jugador_nombre: string | null
  equipo: number | null
  equipo_nombre: string | null
  partido: number | null
  vocalia: number | null
  motivo: string
  articulo: string | null
  fecha_inicio: string
  fecha_fin: string | null
  dias: number
  partidos_sancion: number
  estado: SancionEstado
  estado_display: string
  observaciones: string | null
  created_at: string
  updated_at: string
}

export interface HistorialSancion {
  id: number
  sancion: number
  estado_anterior: string
  estado_nuevo: string
  motivo_cambio: string | null
  usuario: number | null
  created_at: string
}
