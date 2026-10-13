import { create } from 'zustand'
import { capitanUseCase } from '@/infrastructure/factories/capitan.factory'
import type { Capitan } from '@/domain/entities/capitan.entity'
import type { CreateCapitanDto } from '@/application/dtos/capitan.dto'

interface CapitanState {
  items: Capitan[]
  total: number
  page: number
  pageSize: number
  filterTemporada: number | undefined
  filterCategoria: number | undefined
  filterEquipo: number | undefined
  filterActivo: boolean | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface CapitanActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setFilterTemporada(id: number | undefined): Promise<void>
  setFilterCategoria(id: number | undefined): Promise<void>
  setFilterEquipo(id: number | undefined): Promise<void>
  setFilterActivo(value: boolean | undefined): Promise<void>
  create(dto: CreateCapitanDto): Promise<void>
  update(id: number, dto: Partial<CreateCapitanDto>): Promise<void>
  remove(id: number): Promise<void>
  clearError(): void
}

export const useCapitanStore = create<CapitanState & CapitanActions>(
  (set, get) => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    filterTemporada: undefined,
    filterCategoria: undefined,
    filterEquipo: undefined,
    filterActivo: undefined,
    isLoading: false,
    isSaving: false,
    error: null,

    async load() {
      set({ isLoading: true, error: null })
      try {
        const {
          page,
          pageSize,
          filterTemporada,
          filterCategoria,
          filterEquipo,
          filterActivo,
        } = get()
        const result = await capitanUseCase.list({
          page,
          pageSize,
          temporada: filterTemporada,
          categoria: filterCategoria,
          equipo: filterEquipo,
          activo: filterActivo,
        })
        set({ items: result.results, total: result.count, isLoading: false })
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: e.detail ?? e.message ?? 'Error al cargar capitanes',
        })
      }
    },

    async setPage(page) {
      set({ page })
      await get().load()
    },

    async setFilterTemporada(id) {
      set({ filterTemporada: id, page: 1 })
      await get().load()
    },

    async setFilterCategoria(id) {
      set({ filterCategoria: id, page: 1 })
      await get().load()
    },

    async setFilterEquipo(id) {
      set({ filterEquipo: id, page: 1 })
      await get().load()
    },

    async setFilterActivo(value) {
      set({ filterActivo: value, page: 1 })
      await get().load()
    },

    async create(dto) {
      set({ isSaving: true, error: null })
      try {
        await capitanUseCase.create(dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al crear capitán',
        })
        throw err
      }
    },

    async update(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await capitanUseCase.update(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al actualizar capitán',
        })
        throw err
      }
    },

    async remove(id) {
      set({ isSaving: true, error: null })
      try {
        await capitanUseCase.remove(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al eliminar capitán',
        })
        throw err
      }
    },

    clearError() {
      set({ error: null })
    },
  }),
)
