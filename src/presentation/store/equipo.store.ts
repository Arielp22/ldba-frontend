import { create } from 'zustand'
import { equipoUseCase } from '@/infrastructure/factories/equipo.factory'
import type { Equipo } from '@/domain/entities/equipo.entity'
import type {
  CreateEquipoDto,
  UpdateEquipoDto,
} from '@/application/dtos/equipo.dto'

interface EquipoState {
  items: Equipo[]
  total: number
  page: number
  pageSize: number
  search: string
  filterActivo: boolean | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface EquipoActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setSearch(search: string): Promise<void>
  setFilterActivo(value: boolean | undefined): Promise<void>
  create(dto: CreateEquipoDto): Promise<void>
  update(id: number, dto: UpdateEquipoDto): Promise<void>
  remove(id: number): Promise<void>
  resetPassword(id: number, newPassword: string): Promise<void>
  clearError(): void
}

export const useEquipoStore = create<EquipoState & EquipoActions>((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  search: '',
  filterActivo: undefined,
  isLoading: false,
  isSaving: false,
  error: null,

  async load() {
    set({ isLoading: true, error: null })
    try {
      const { page, pageSize, search, filterActivo } = get()
      const result = await equipoUseCase.list({
        page,
        pageSize,
        search,
        activo: filterActivo,
      })
      set({ items: result.results, total: result.count, isLoading: false })
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isLoading: false,
        error: e.detail ?? e.message ?? 'Error al cargar equipos',
      })
    }
  },

  async setPage(page) {
    set({ page })
    await get().load()
  },

  async setSearch(search) {
    set({ search, page: 1 })
    await get().load()
  },

  async setFilterActivo(value) {
    set({ filterActivo: value, page: 1 })
    await get().load()
  },

  async create(dto) {
    set({ isSaving: true, error: null })
    try {
      await equipoUseCase.create(dto)
      set({ isSaving: false })
      await get().load()
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al crear equipo',
      })
      throw err
    }
  },

  async update(id, dto) {
    set({ isSaving: true, error: null })
    try {
      await equipoUseCase.update(id, dto)
      set({ isSaving: false })
      await get().load()
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al actualizar equipo',
      })
      throw err
    }
  },

  async remove(id) {
    set({ isSaving: true, error: null })
    try {
      await equipoUseCase.remove(id)
      set({ isSaving: false })
      await get().load()
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al eliminar equipo',
      })
      throw err
    }
  },

  async resetPassword(id, newPassword) {
    set({ isSaving: true, error: null })
    try {
      await equipoUseCase.resetPassword(id, newPassword)
      set({ isSaving: false })
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al resetear contraseña',
      })
      throw err
    }
  },

  clearError() {
    set({ error: null })
  },
}))
