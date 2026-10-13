import type {
  PartidoAdmin,
  SorteoVocaliasResponse,
} from '../entities/partido-admin.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListPartidosParams {
  page?: number
  pageSize?: number
  jornada?: number
  dia?: string
  estado?: string
  equipo_local?: number
  equipo_visitante?: number
  equipo_vocal?: number
}

export interface CreatePartidoPayload {
  jornada: number
  numero_partido: number
  dia: string
  hora?: string
  equipo_local: number
  equipo_visitante: number
  equipo_vocal?: number
  estado?: string
  observaciones?: string
}

export interface UpdatePartidoPayload {
  numero_partido?: number
  dia?: string
  hora?: string
  equipo_local?: number
  equipo_visitante?: number
  equipo_vocal?: number | null
  estado?: string
  observaciones?: string
}

export interface RegistrarResultadoPayload {
  goles_local: number
  goles_visitante: number
  observaciones?: string
}

export interface PartidoAdminRepository {
  list(params: ListPartidosParams): Promise<PaginatedResult<PartidoAdmin>>
  get(id: number): Promise<PartidoAdmin>
  create(payload: CreatePartidoPayload): Promise<PartidoAdmin>
  update(id: number, payload: UpdatePartidoPayload): Promise<PartidoAdmin>
  remove(id: number): Promise<void>
  registrarResultado(
    id: number,
    payload: RegistrarResultadoPayload,
  ): Promise<PartidoAdmin>
  sortearVocalias(jornadaId: number): Promise<SorteoVocaliasResponse>
}
