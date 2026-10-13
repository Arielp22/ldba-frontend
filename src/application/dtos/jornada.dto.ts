import type { JornadaEstado } from '@/domain/entities/jornada.entity'

export interface CreateJornadaDto {
  temporada: number
  categoria: number
  numero: number
  fecha_sabado: string
  fecha_domingo: string
  estado?: JornadaEstado
}

export interface UpdateJornadaDto {
  temporada?: number
  categoria?: number
  numero?: number
  fecha_sabado?: string
  fecha_domingo?: string
  estado?: JornadaEstado
}
