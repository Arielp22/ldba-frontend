export type LesionTipo =
  | 'esguince'
  | 'fractura'
  | 'desgarro'
  | 'contusion'
  | 'luxacion'
  | 'otro'

export type LesionGravedad = 'leve' | 'moderada' | 'grave'

export type LesionEstado =
  | 'reportada'
  | 'en_revision'
  | 'aprobada'
  | 'rechazada'
  | 'pagada'

export interface Lesion {
  id: number
  jugador: number
  jugador_nombre: string
  equipo: number | null
  equipo_nombre: string | null
  partido: number | null
  vocalia: number | null
  fecha: string
  tipo: LesionTipo
  tipo_display: string
  gravedad: LesionGravedad
  gravedad_display: string
  descripcion: string | null
  monto_apoyo: string | null
  estado: LesionEstado
  estado_display: string
  observaciones: string | null
  created_at: string
  updated_at: string
}
