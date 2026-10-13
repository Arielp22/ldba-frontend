import { create } from 'zustand'
import { sesionUseCase } from '@/infrastructure/factories/sesion.factory'
import type { Sesion } from '@/domain/entities/sesion.entity'
import type {
  CreateSesionDto,
  UpdateSesionDto,
} from '@/application/dtos/sesion.dto'

interface SesionState {
  items: Sesion[]
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

interface SesionActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setSearch(search: string): Promise<void>
  setFilterTipo(tipo: string | undefined): Promise<void>
  setFilterEstado(estado: string | undefined): Promise<void>
  create(dto: CreateSesionDto): Promise<void>
  update(id: number, dto: UpdateSesionDto): Promise<void>
  remove(id: number): Promise<void>
  finalizar(id: number): Promise<void>
  clearError(): void
}

export const useSesionStore = create<SesionState & SesionActions>(
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
        const result = await sesionUseCase.list({
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
          error: e.detail ?? e.message ?? 'Error al cargar sesiones',
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
        await sesionUseCase.create(dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al crear sesión',
        })
        throw err
      }
    },

    async update(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await sesionUseCase.update(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al actualizar sesión',
        })
        throw err
      }
    },

    async remove(id) {
      set({ isSaving: true, error: null })
      try {
        await sesionUseCase.remove(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al eliminar sesión',
        })
        throw err
      }
    },

    async finalizar(id) {
      set({ isSaving: true, error: null })
      try {
        await sesionUseCase.finalizar(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al finalizar sesión',
        })
        throw err
      }
    },

    clearError() {
      set({ error: null })
    },
  }),
)
