import { create } from 'zustand'
import { jugadorUseCase } from '@/infrastructure/factories/jugador.factory'
import type { Jugador } from '@/domain/entities/jugador.entity'
import type {
  CreateJugadorDto,
  UpdateJugadorDto,
  CalificarJugadorDto,
} from '@/application/dtos/jugador.dto'

interface JugadorState {
  items: Jugador[]
  total: number
  page: number
  pageSize: number
  search: string
  filterEstado: string | undefined
  filterActivo: boolean | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface JugadorActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setSearch(search: string): Promise<void>
  setFilterEstado(estado: string | undefined): Promise<void>
  setFilterActivo(value: boolean | undefined): Promise<void>
  create(dto: CreateJugadorDto): Promise<void>
  update(id: number, dto: UpdateJugadorDto): Promise<void>
  remove(id: number): Promise<void>
  calificar(id: number, dto: CalificarJugadorDto): Promise<void>
  clearError(): void
}

export const useJugadorStore = create<JugadorState & JugadorActions>(
  (set, get) => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    search: '',
    filterEstado: undefined,
    filterActivo: undefined,
    isLoading: false,
    isSaving: false,
    error: null,

    async load() {
      set({ isLoading: true, error: null })
      try {
        const { page, pageSize, search, filterEstado, filterActivo } = get()
        const result = await jugadorUseCase.list({
          page,
          pageSize,
          search,
          estado_calificacion: filterEstado,
          activo: filterActivo,
        })
        set({ items: result.results, total: result.count, isLoading: false })
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: e.detail ?? e.message ?? 'Error al cargar jugadores',
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

    async setFilterActivo(value) {
      set({ filterActivo: value, page: 1 })
      await get().load()
    },

    async create(dto) {
      set({ isSaving: true, error: null })
      try {
        await jugadorUseCase.create(dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al crear jugador',
        })
        throw err
      }
    },

    async update(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await jugadorUseCase.update(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al actualizar jugador',
        })
        throw err
      }
    },

    async remove(id) {
      set({ isSaving: true, error: null })
      try {
        await jugadorUseCase.remove(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al eliminar jugador',
        })
        throw err
      }
    },

    async calificar(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await jugadorUseCase.calificar(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al calificar jugador',
        })
        throw err
      }
    },

    clearError() {
      set({ error: null })
    },
  }),
)
