import { create } from 'zustand'
import { temporadaUseCase } from '@/infrastructure/factories/temporada.factory'
import type { Temporada } from '@/domain/entities/temporada.entity'
import type {
  CreateTemporadaDto,
  UpdateTemporadaDto,
} from '@/application/dtos/temporada.dto'

interface TemporadaState {
  items: Temporada[]
  total: number
  page: number
  pageSize: number
  search: string
  filterEstado: string | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface TemporadaActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setSearch(search: string): Promise<void>
  setFilterEstado(estado: string | undefined): Promise<void>
  create(dto: CreateTemporadaDto): Promise<void>
  update(id: number, dto: UpdateTemporadaDto): Promise<void>
  remove(id: number): Promise<void>
  clearError(): void
}

export const useTemporadaStore = create<TemporadaState & TemporadaActions>(
  (set, get) => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    search: '',
    filterEstado: undefined,
    isLoading: false,
    isSaving: false,
    error: null,

    async load() {
      set({ isLoading: true, error: null })
      try {
        const { page, pageSize, search, filterEstado } = get()
        const result = await temporadaUseCase.list({
          page,
          pageSize,
          search,
          estado: filterEstado,
        })
        set({
          items: result.results,
          total: result.count,
          isLoading: false,
        })
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: e.detail ?? e.message ?? 'Error al cargar temporadas',
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

    async setFilterEstado(estado) {
      set({ filterEstado: estado, page: 1 })
      await get().load()
    },

    async create(dto) {
      set({ isSaving: true, error: null })
      try {
        await temporadaUseCase.create(dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al crear temporada',
        })
        throw err
      }
    },

    async update(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await temporadaUseCase.update(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al actualizar temporada',
        })
        throw err
      }
    },

    async remove(id) {
      set({ isSaving: true, error: null })
      try {
        await temporadaUseCase.remove(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al eliminar temporada',
        })
        throw err
      }
    },

    clearError() {
      set({ error: null })
    },
  }),
)
