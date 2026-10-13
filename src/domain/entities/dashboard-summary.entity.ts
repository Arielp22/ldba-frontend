import type { Partido } from './partido.entity'
import type { Noticia } from './noticia.entity'
import type { Posicion } from './posicion.entity'
import type { Goleador } from './goleador.entity'
import type { UsuarioStats } from './usuario-stats.entity'
import type { MovimientoResumen } from './movimiento-resumen.entity'

export interface DashboardData {
  proximosPartidos: Partido[]
  resultadosRecientes: Partido[]
  ultimasNoticias: Noticia[]
  topPosiciones: Posicion[]
  topGoleadores: Goleador[]
  usuariosStats: UsuarioStats | null
  finanzasResumen: MovimientoResumen | null
}
