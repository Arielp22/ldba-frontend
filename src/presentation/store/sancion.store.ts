import { create } from 'zustand'
import { sancionUseCase } from '@/infrastructure/factories/sancion.factory'
import type { Sancion } from '@/domain/entities/sancion.entity'
import type {
  CreateSancionDto,
  UpdateSancionDto,
  CambiarEstadoSancionDto,
} from '@/application/dtos/sancion.dto'

interface SancionState {
  items: Sancion[]
  total: number
  page: number
  pageSize: number
  search: string
  filterTipo: string | undefined
  filterEstado: string | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface SancionActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setSearch(search: string): Promise<void>
  setFilterTipo(tipo: string | undefined): Promise<void>
  setFilterEstado(estado: string | undefined): Promise<void>
  create(dto: CreateSancionDto): Promise<void>
  update(id: number, dto: UpdateSancionDto): Promise<void>
  remove(id: number): Promise<void>
  cambiarEstado(id: number, dto: CambiarEstadoSancionDto): Promise<void>
  clearError(): void
}

export const useSancionStore = create<SancionState & SancionActions>(
  (set, get) => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    search: '',
    filterTipo: undefined,
    filterEstado: undefined,
    isLoading: false,
    isSaving: false,
    error: null,

    async load() {
      set({ isLoading: true, error: null })
      try {
        const { page, pageSize, search, filterTipo, filterEstado } = get()
        const result = await sancionUseCase.list({
          page,
          pageSize,
          search,
          tipo: filterTipo,
          estado: filterEstado,
        })
        set({ items: result.results, total: result.count, isLoading: false })
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: e.detail ?? e.message ?? 'Error al cargar sanciones',
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

    async setFilterTipo(tipo) {
      set({ filterTipo: tipo, page: 1 })
      await get().load()
    },

    async setFilterEstado(estado) {
      set({ filterEstado: estado, page: 1 })
      await get().load()
    },

    async create(dto) {
      set({ isSaving: true, error: null })
      try {
        await sancionUseCase.create(dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al crear sanción',
        })
        throw err
      }
    },

    async update(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await sancionUseCase.update(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al actualizar sanción',
        })
        throw err
      }
    },

    async remove(id) {
      set({ isSaving: true, error: null })
      try {
        await sancionUseCase.remove(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al eliminar sanción',
        })
        throw err
      }
    },

    async cambiarEstado(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await sancionUseCase.cambiarEstado(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al cambiar estado',
        })
        throw err
      }
    },

    clearError() {
      set({ error: null })
    },
  }),
)
