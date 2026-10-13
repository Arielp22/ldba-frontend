import { create } from 'zustand'
import { jornadaUseCase } from '@/infrastructure/factories/jornada.factory'
import type { Jornada } from '@/domain/entities/jornada.entity'
import type {
  CreateJornadaDto,
  UpdateJornadaDto,
} from '@/application/dtos/jornada.dto'

interface JornadaState {
  items: Jornada[]
  total: number
  page: number
  pageSize: number
  search: string
  filterTemporada: number | undefined
  filterCategoria: number | undefined
  filterEstado: string | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface JornadaActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setSearch(search: string): Promise<void>
  setFilterTemporada(id: number | undefined): Promise<void>
  setFilterCategoria(id: number | undefined): Promise<void>
  setFilterEstado(estado: string | undefined): Promise<void>
  create(dto: CreateJornadaDto): Promise<void>
  update(id: number, dto: UpdateJornadaDto): Promise<void>
  remove(id: number): Promise<void>
  clearError(): void
}

export const useJornadaStore = create<JornadaState & JornadaActions>(
  (set, get) => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    search: '',
    filterTemporada: undefined,
    filterCategoria: undefined,
    filterEstado: undefined,
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
          filterTemporada,
          filterCategoria,
          filterEstado,
        } = get()
        const result = await jornadaUseCase.list({
          page,
          pageSize,
          search,
          temporada: filterTemporada,
          categoria: filterCategoria,
          estado: filterEstado,
        })
        set({ items: result.results, total: result.count, isLoading: false })
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: e.detail ?? e.message ?? 'Error al cargar jornadas',
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

    async setFilterTemporada(id) {
      set({ filterTemporada: id, page: 1 })
      await get().load()
    },

    async setFilterCategoria(id) {
      set({ filterCategoria: id, page: 1 })
      await get().load()
    },

    async setFilterEstado(estado) {
      set({ filterEstado: estado, page: 1 })
      await get().load()
    },

    async create(dto) {
      set({ isSaving: true, error: null })
      try {
        await jornadaUseCase.create(dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al crear jornada',
        })
        throw err
      }
    },

    async update(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await jornadaUseCase.update(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al actualizar jornada',
        })
        throw err
      }
    },

    async remove(id) {
      set({ isSaving: true, error: null })
      try {
        await jornadaUseCase.remove(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al eliminar jornada',
        })
        throw err
      }
    },

    clearError() {
      set({ error: null })
    },
  }),
)
