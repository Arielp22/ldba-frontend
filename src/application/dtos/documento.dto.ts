export interface CreateDocumentoDto {
  tipo: string
  titulo: string
  descripcion?: string
  archivo: string
  mime_type?: string
  tamano_bytes?: number
  jugador?: number | null
  equipo?: number | null
  sesion?: number | null
}

export interface UpdateDocumentoDto {
  tipo?: string
  titulo?: string
  descripcion?: string
  archivo?: string
  mime_type?: string
  tamano_bytes?: number
  jugador?: number | null
  equipo?: number | null
  sesion?: number | null
}
