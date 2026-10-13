import { create } from 'zustand'
import { lesionUseCase } from '@/infrastructure/factories/lesion.factory'
import type { Lesion } from '@/domain/entities/lesion.entity'
import type {
  CreateLesionDto,
  UpdateLesionDto,
  CambiarEstadoLesionDto,
} from '@/application/dtos/lesion.dto'

interface LesionState {
  items: Lesion[]
  total: number
  page: number
  pageSize: number
  search: string
  filterEstado: string | undefined
  filterGravedad: string | undefined
  filterTipo: string | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface LesionActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setSearch(search: string): Promise<void>
  setFilterEstado(estado: string | undefined): Promise<void>
  setFilterGravedad(gravedad: string | undefined): Promise<void>
  setFilterTipo(tipo: string | undefined): Promise<void>
  create(dto: CreateLesionDto): Promise<void>
  update(id: number, dto: UpdateLesionDto): Promise<void>
  remove(id: number): Promise<void>
  cambiarEstado(id: number, dto: CambiarEstadoLesionDto): Promise<void>
  clearError(): void
}

export const useLesionStore = create<LesionState & LesionActions>(
  (set, get) => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    search: '',
    filterEstado: undefined,
    filterGravedad: undefined,
    filterTipo: undefined,
    isLoading: false,
    isSaving: false,
    error: null,

    async load() {
      set({ isLoading: true, error: null })
      try {
        const {
          page,
          pageSize,
          search,
          filterEstado,
          filterGravedad,
          filterTipo,
        } = get()
        const result = await lesionUseCase.list({
          page,
          pageSize,
          search,
          estado: filterEstado,
          gravedad: filterGravedad,
          tipo: filterTipo,
        })
        set({ items: result.results, total: result.count, isLoading: false })
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: e.detail ?? e.message ?? 'Error al cargar lesiones',
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

    async setFilterGravedad(gravedad) {
      set({ filterGravedad: gravedad, page: 1 })
      await get().load()
    },

    async setFilterTipo(tipo) {
      set({ filterTipo: tipo, page: 1 })
      await get().load()
    },

    async create(dto) {
      set({ isSaving: true, error: null })
      try {
        await lesionUseCase.create(dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al crear lesión',
        })
        throw err
      }
    },

    async update(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await lesionUseCase.update(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al actualizar lesión',
        })
        throw err
      }
    },

    async remove(id) {
      set({ isSaving: true, error: null })
      try {
        await lesionUseCase.remove(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al eliminar lesión',
        })
        throw err
      }
    },

    async cambiarEstado(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await lesionUseCase.cambiarEstado(id, dto)
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
