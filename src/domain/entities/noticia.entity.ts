export interface Noticia {
  id: number
  titulo: string
  resumen: string | null
  contenido: string
  imagen: string | null
  autor: string | null
  publicada: boolean
  destacada: boolean
  fecha_publicacion: string | null
  created_at: string
  updated_at: string
}

export interface NoticiaPublica {
  id: number
  titulo: string
  resumen: string | null
  contenido: string
  imagen: string | null
  autor: string | null
  destacada: boolean
  fecha_publicacion: string | null
}
