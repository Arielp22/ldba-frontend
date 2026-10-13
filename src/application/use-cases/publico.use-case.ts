import type {
  PublicoRepository,
  TablaPosicionesResponse,
  GoleadoresResponse,
  TarjetasResponse,
} from '@/domain/ports/publico.repository'
import type { Temporada } from '@/domain/entities/temporada.entity'
import type { Categoria } from '@/domain/entities/categoria.entity'
import type { Equipo } from '@/domain/entities/equipo.entity'
import type { NoticiaPublica } from '@/domain/entities/noticia.entity'
import type { Partido } from '@/domain/entities/partido.entity'

export class PublicoUseCase {
  constructor(private readonly repo: PublicoRepository) {}

  getTemporadas(): Promise<Temporada[]> {
    return this.repo.getTemporadas()
  }

  getCategorias(): Promise<Categoria[]> {
    return this.repo.getCategorias()
  }

  getEquipos(): Promise<Equipo[]> {
    return this.repo.getEquipos()
  }

  getTablaPosiciones(
    temporadaId: number,
    categoriaId?: number,
  ): Promise<TablaPosicionesResponse> {
    return this.repo.getTablaPosiciones(temporadaId, categoriaId)
  }

  getGoleadores(
    temporadaId: number,
    categoriaId?: number,
    limit?: number,
  ): Promise<GoleadoresResponse> {
    return this.repo.getGoleadores(temporadaId, categoriaId, limit)
  }

  getTarjetas(
    temporadaId: number,
    categoriaId?: number,
  ): Promise<TarjetasResponse> {
    return this.repo.getTarjetas(temporadaId, categoriaId)
  }

  getNoticias(page = 1, pageSize = 10) {
    return this.repo.getNoticias(page, pageSize)
  }

  getNoticiaDetalle(id: number): Promise<NoticiaPublica> {
    return this.repo.getNoticiaDetalle(id)
  }

  getProximosPartidos(): Promise<Partido[]> {
    return this.repo.getProximosPartidos()
  }

  getResultadosRecientes(): Promise<Partido[]> {
    return this.repo.getResultadosRecientes()
  }
}
