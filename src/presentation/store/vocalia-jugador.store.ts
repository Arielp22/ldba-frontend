import { create } from 'zustand'
import { vocaliaJugadorUseCase } from '@/infrastructure/factories/vocalia-jugador.factory'
import type { VocaliaJugador } from '@/domain/entities/vocalia-jugador.entity'
import type {
  CreateVocaliaJugadorDto,
  UpdateVocaliaJugadorDto,
} from '@/application/dtos/vocalia-jugador.dto'

interface VocaliaJugadorState {
  items: VocaliaJugador[]
  total: number
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface VocaliaJugadorActions {
  loadByVocalia(vocaliaId: number): Promise<void>
  create(dto: CreateVocaliaJugadorDto): Promise<void>
  update(id: number, dto: UpdateVocaliaJugadorDto): Promise<void>
  remove(id: number, vocaliaId: number): Promise<void>
  clear(): void
  clearError(): void
}

export const useVocaliaJugadorStore = create<
  VocaliaJugadorState & VocaliaJugadorActions
>((set, get) => ({
  items: [],
  total: 0,
  isLoading: false,
  isSaving: false,
  error: null,

  async loadByVocalia(vocaliaId) {
    set({ isLoading: true, error: null })
    try {
      const result = await vocaliaJugadorUseCase.list({
        vocalia: vocaliaId,
        pageSize: 200,
      })
      set({ items: result.results, total: result.count, isLoading: false })
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isLoading: false,
        error: e.detail ?? e.message ?? 'Error al cargar jugadores',
      })
    }
  },

  async create(dto) {
    set({ isSaving: true, error: null })
    try {
      await vocaliaJugadorUseCase.create(dto)
      set({ isSaving: false })
      await get().loadByVocalia(dto.vocalia)
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al agregar jugador',
      })
      throw err
    }
  },

  async update(id, dto) {
    set({ isSaving: true, error: null })
    try {
      const updated = await vocaliaJugadorUseCase.update(id, dto)
      set({ isSaving: false })
      await get().loadByVocalia(updated.vocalia)
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al actualizar',
      })
      throw err
    }
  },

  async remove(id, vocaliaId) {
    set({ isSaving: true, error: null })
    try {
      await vocaliaJugadorUseCase.remove(id)
      set({ isSaving: false })
      await get().loadByVocalia(vocaliaId)
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al eliminar',
      })
      throw err
    }
  },

  clear() {
    set({ items: [], total: 0, error: null })
  },

  clearError() {
    set({ error: null })
  },
}))
