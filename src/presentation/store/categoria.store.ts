import { create } from 'zustand'
import { categoriaUseCase } from '@/infrastructure/factories/categoria.factory'
import type { Categoria } from '@/domain/entities/categoria.entity'
import type {
  CreateCategoriaDto,
  UpdateCategoriaDto,
} from '@/application/dtos/categoria.dto'

interface CategoriaState {
  items: Categoria[]
  total: number
  page: number
  pageSize: number
  search: string
  filterActiva: boolean | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface CategoriaActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setSearch(search: string): Promise<void>
  setFilterActiva(value: boolean | undefined): Promise<void>
  create(dto: CreateCategoriaDto): Promise<void>
  update(id: number, dto: UpdateCategoriaDto): Promise<void>
  remove(id: number): Promise<void>
  clearError(): void
}

export const useCategoriaStore = create<CategoriaState & CategoriaActions>(
  (set, get) => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    search: '',
    filterActiva: undefined,
    isLoading: false,
    isSaving: false,
    error: null,

    async load() {
      set({ isLoading: true, error: null })
      try {
        const { page, pageSize, search, filterActiva } = get()
        const result = await categoriaUseCase.list({
          page,
          pageSize,
          search,
          activa: filterActiva,
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
          error: e.detail ?? e.message ?? 'Error al cargar categorías',
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

    async setFilterActiva(value) {
      set({ filterActiva: value, page: 1 })
      await get().load()
    },

    async create(dto) {
      set({ isSaving: true, error: null })
      try {
        await categoriaUseCase.create(dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al crear categoría',
        })
        throw err
      }
    },

    async update(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await categoriaUseCase.update(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al actualizar categoría',
        })
        throw err
      }
    },

    async remove(id) {
      set({ isSaving: true, error: null })
      try {
        await categoriaUseCase.remove(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al eliminar categoría',
        })
        throw err
      }
    },

    clearError() {
      set({ error: null })
    },
  }),
)
