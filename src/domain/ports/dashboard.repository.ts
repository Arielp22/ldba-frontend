import type { Partido } from '../entities/partido.entity'
import type { Noticia } from '../entities/noticia.entity'
import type { Posicion } from '../entities/posicion.entity'
import type { Goleador } from '../entities/goleador.entity'
import type { UsuarioStats } from '../entities/usuario-stats.entity'
import type { MovimientoResumen } from '../entities/movimiento-resumen.entity'

/**
 * Contrato de acceso a datos del Dashboard.
 * Cada método consulta un endpoint independiente.
 */
export interface DashboardRepository {
  getProximosPartidos(limit?: number): Promise<Partido[]>
  getResultadosRecientes(limit?: number): Promise<Partido[]>
  getUltimasNoticias(limit?: number): Promise<Noticia[]>
  getTopPosiciones(temporadaId: number, limit?: number): Promise<Posicion[]>
  getTopGoleadores(temporadaId: number, limit?: number): Promise<Goleador[]>
  getUsuariosStats(): Promise<UsuarioStats>
  getFinanzasResumen(): Promise<MovimientoResumen>
}
