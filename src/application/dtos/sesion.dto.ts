export interface CreateSesionDto {
  fecha: string
  tipo?: string
  orden_del_dia?: string
  acta?: string
  estado?: string
  observaciones?: string
}

export interface UpdateSesionDto {
  fecha?: string
  tipo?: string
  orden_del_dia?: string
  acta?: string
  estado?: string
  observaciones?: string
}
