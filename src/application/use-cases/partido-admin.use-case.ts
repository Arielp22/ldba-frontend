import type {
  PartidoAdminRepository,
  ListPartidosParams,
  CreatePartidoPayload,
  UpdatePartidoPayload,
  RegistrarResultadoPayload,
} from '@/domain/ports/partido-admin.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type {
  PartidoAdmin,
  SorteoVocaliasResponse,
} from '@/domain/entities/partido-admin.entity'

export class PartidoAdminUseCase {
  constructor(private readonly repo: PartidoAdminRepository) {}

  list(params: ListPartidosParams): Promise<PaginatedResult<PartidoAdmin>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<PartidoAdmin> {
    return this.repo.get(id)
  }

  create(payload: CreatePartidoPayload): Promise<PartidoAdmin> {
    return this.repo.create(payload)
  }

  update(id: number, payload: UpdatePartidoPayload): Promise<PartidoAdmin> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }

  registrarResultado(
    id: number,
    payload: RegistrarResultadoPayload,
  ): Promise<PartidoAdmin> {
    return this.repo.registrarResultado(id, payload)
  }

  sortearVocalias(jornadaId: number): Promise<SorteoVocaliasResponse> {
    return this.repo.sortearVocalias(jornadaId)
  }
}
