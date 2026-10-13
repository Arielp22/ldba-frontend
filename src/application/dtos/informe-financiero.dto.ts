export interface CreateInformeDto {
  numero_semana: number
  anio: number
  fecha_semana: string
  cerveza?: string | number
  boleteria?: string | number
  multas?: string | number
  otros_ingresos?: string | number
  egresos?: string | number
  estado?: string
  observaciones?: string
}

export interface UpdateInformeDto {
  cerveza?: string | number
  boleteria?: string | number
  multas?: string | number
  otros_ingresos?: string | number
  egresos?: string | number
  estado?: string
  observaciones?: string
}
