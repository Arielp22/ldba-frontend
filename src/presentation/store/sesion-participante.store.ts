import { create } from 'zustand'
import { sesionParticipanteUseCase } from '@/infrastructure/factories/sesion-participante.factory'
import type { SesionParticipante } from '@/domain/entities/sesion-participante.entity'
import type {
  CreateSesionParticipanteDto,
  UpdateSesionParticipanteDto,
} from '@/application/dtos/sesion-participante.dto'

interface SesionParticipanteState {
  items: SesionParticipante[]
  total: number
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface SesionParticipanteActions {
  loadBySesion(sesionId: number): Promise<void>
  create(dto: CreateSesionParticipanteDto): Promise<void>
  update(id: number, dto: UpdateSesionParticipanteDto): Promise<void>
  remove(id: number, sesionId: number): Promise<void>
  clear(): void
  clearError(): void
}

export const useSesionParticipanteStore = create<
  SesionParticipanteState & SesionParticipanteActions
>((set, get) => ({
  items: [],
  total: 0,
  isLoading: false,
  isSaving: false,
  error: null,

  async loadBySesion(sesionId) {
    set({ isLoading: true, error: null })
    try {
      const result = await sesionParticipanteUseCase.list({
        sesion: sesionId,
        pageSize: 200,
      })
      set({ items: result.results, total: result.count, isLoading: false })
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isLoading: false,
        error: e.detail ?? e.message ?? 'Error al cargar participantes',
      })
    }
  },

  async create(dto) {
    set({ isSaving: true, error: null })
    try {
      await sesionParticipanteUseCase.create(dto)
      set({ isSaving: false })
      await get().loadBySesion(dto.sesion)
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al agregar participante',
      })
      throw err
    }
  },

  async update(id, dto) {
    set({ isSaving: true, error: null })
    try {
      const updated = await sesionParticipanteUseCase.update(id, dto)
      set({ isSaving: false })
      await get().loadBySesion(updated.sesion)
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al actualizar participante',
      })
      throw err
    }
  },

  async remove(id, sesionId) {
    set({ isSaving: true, error: null })
    try {
      await sesionParticipanteUseCase.remove(id)
      set({ isSaving: false })
      await get().loadBySesion(sesionId)
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al eliminar participante',
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
