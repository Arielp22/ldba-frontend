import type { TemporadaEstado } from '@/domain/entities/temporada.entity'

export interface CreateTemporadaDto {
  nombre: string
  anio: number
  fecha_inicio: string
  fecha_fin: string
  estado?: TemporadaEstado
}

export interface UpdateTemporadaDto {
  nombre?: string
  anio?: number
  fecha_inicio?: string
  fecha_fin?: string
  estado?: TemporadaEstado
}
