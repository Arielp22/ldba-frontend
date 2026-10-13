import type { Temporada } from '../entities/temporada.entity'
import type { Categoria } from '../entities/categoria.entity'
import type { Equipo } from '../entities/equipo.entity'
import type { Posicion } from '../entities/posicion.entity'
import type { Goleador } from '../entities/goleador.entity'
import type { NoticiaPublica } from '../entities/noticia.entity'
import type { Partido } from '../entities/partido.entity'

/** Tarjeta (para ranking de tarjetas amarillas y rojas). */
export interface Tarjeta {
  jugador_id: number
  jugador: string
  equipo: string
  amarillas: number
  rojas: number
  total: number
}

export interface TablaPosicionesResponse {
  temporada: number
  categoria: number | null
  tabla: Posicion[]
}

export interface GoleadoresResponse {
  temporada: number
  categoria: number | null
  goleadores: Goleador[]
}

export interface TarjetasResponse {
  temporada: number
  categoria: number | null
  tarjetas: Tarjeta[]
}

export interface PublicoRepository {
  getTemporadas(): Promise<Temporada[]>
  getCategorias(): Promise<Categoria[]>
  getEquipos(): Promise<Equipo[]>
  getTablaPosiciones(
    temporadaId: number,
    categoriaId?: number,
  ): Promise<TablaPosicionesResponse>
  getGoleadores(
    temporadaId: number,
    categoriaId?: number,
    limit?: number,
  ): Promise<GoleadoresResponse>
  getTarjetas(
    temporadaId: number,
    categoriaId?: number,
  ): Promise<TarjetasResponse>
  getNoticias(page?: number, pageSize?: number): Promise<{
    count: number
    results: NoticiaPublica[]
  }>
  getNoticiaDetalle(id: number): Promise<NoticiaPublica>
  getProximosPartidos(): Promise<Partido[]>
  getResultadosRecientes(): Promise<Partido[]>
}
