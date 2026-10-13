import type {
  VocaliaRepository,
  ListVocaliasParams,
  CreateVocaliaPayload,
  UpdateVocaliaPayload,
} from '@/domain/ports/vocalia.repository'
import type { PaginatedResult } from '@/domain/ports/categoria.repository'
import type { Vocalia } from '@/domain/entities/vocalia.entity'

export class VocaliaUseCase {
  constructor(private readonly repo: VocaliaRepository) {}

  list(params: ListVocaliasParams): Promise<PaginatedResult<Vocalia>> {
    return this.repo.list(params)
  }

  get(id: number): Promise<Vocalia> {
    return this.repo.get(id)
  }

  create(payload: CreateVocaliaPayload): Promise<Vocalia> {
    return this.repo.create(payload)
  }

  update(id: number, payload: UpdateVocaliaPayload): Promise<Vocalia> {
    return this.repo.update(id, payload)
  }

  remove(id: number): Promise<void> {
    return this.repo.remove(id)
  }

  aprobar(id: number): Promise<Vocalia> {
    return this.repo.aprobar(id)
  }

  rechazar(id: number, observaciones: string): Promise<Vocalia> {
    return this.repo.rechazar(id, observaciones)
  }

  sincronizarResultado(id: number): Promise<Vocalia> {
    return this.repo.sincronizarResultado(id)
  }
}
