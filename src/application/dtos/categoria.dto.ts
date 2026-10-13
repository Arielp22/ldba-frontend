export interface CreateCategoriaDto {
  nombre: string
  descripcion?: string | null
  activa?: boolean
}

export interface UpdateCategoriaDto {
  nombre?: string
  descripcion?: string | null
  activa?: boolean
}
