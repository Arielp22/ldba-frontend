export interface CreateNoticiaDto {
  titulo: string
  resumen?: string
  contenido: string
  imagen?: string
  autor?: string
  publicada?: boolean
  destacada?: boolean
  fecha_publicacion?: string | null
}

export interface UpdateNoticiaDto {
  titulo?: string
  resumen?: string
  contenido?: string
  imagen?: string
  autor?: string
  publicada?: boolean
  destacada?: boolean
  fecha_publicacion?: string | null
}
