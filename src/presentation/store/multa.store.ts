import { create } from 'zustand'
import { multaUseCase } from '@/infrastructure/factories/multa.factory'
import type { Multa } from '@/domain/entities/multa.entity'
import type {
  CreateMultaDto,
  UpdateMultaDto,
  MarcarPagadaDto,
} from '@/application/dtos/multa.dto'

interface MultaState {
  items: Multa[]
  total: number
  page: number
  pageSize: number
  search: string
  filterEstado: string | undefined
  filterEquipo: number | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface MultaActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setSearch(search: string): Promise<void>
  setFilterEstado(estado: string | undefined): Promise<void>
  setFilterEquipo(id: number | undefined): Promise<void>
  create(dto: CreateMultaDto): Promise<void>
  update(id: number, dto: UpdateMultaDto): Promise<void>
  remove(id: number): Promise<void>
  marcarPagada(id: number, dto: MarcarPagadaDto): Promise<void>
  clearError(): void
}

export const useMultaStore = create<MultaState & MultaActions>(
  (set, get) => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    search: '',
    filterEstado: undefined,
    filterEquipo: undefined,
    isLoading: false,
    isSaving: false,
    error: null,

    async load() {
      set({ isLoading: true, error: null })
      try {
        const { page, pageSize, search, filterEstado, filterEquipo } = get()
        const result = await multaUseCase.list({
          page,
          pageSize,
          search,
          estado: filterEstado,
          equipo: filterEquipo,
        })
        set({ items: result.results, total: result.count, isLoading: false })
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: e.detail ?? e.message ?? 'Error al cargar multas',
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

    async setFilterEquipo(id) {
      set({ filterEquipo: id, page: 1 })
      await get().load()
    },

    async create(dto) {
      set({ isSaving: true, error: null })
      try {
        await multaUseCase.create(dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al crear multa',
        })
        throw err
      }
    },

    async update(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await multaUseCase.update(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al actualizar multa',
        })
        throw err
      }
    },

    async remove(id) {
      set({ isSaving: true, error: null })
      try {
        await multaUseCase.remove(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al eliminar multa',
        })
        throw err
      }
    },

    async marcarPagada(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await multaUseCase.marcarPagada(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al marcar como pagada',
        })
        throw err
      }
    },

    clearError() {
      set({ error: null })
    },
  }),
)
