export type DocumentoTipo =
  | 'cedula'
  | 'acta'
  | 'factura'
  | 'informe'
  | 'carnet'
  | 'otro'

export interface Documento {
  id: number
  tipo: DocumentoTipo
  tipo_display: string
  titulo: string
  descripcion: string | null
  archivo: string
  mime_type: string | null
  tamano_bytes: number | null
  jugador: number | null
  jugador_nombre: string | null
  equipo: number | null
  equipo_nombre: string | null
  sesion: number | null
  created_at: string
  updated_at: string
}
