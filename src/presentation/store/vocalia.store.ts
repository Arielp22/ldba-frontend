import { create } from 'zustand'
import { vocaliaUseCase } from '@/infrastructure/factories/vocalia.factory'
import type { Vocalia } from '@/domain/entities/vocalia.entity'
import type {
  CreateVocaliaDto,
  UpdateVocaliaDto,
} from '@/application/dtos/vocalia.dto'

interface VocaliaState {
  items: Vocalia[]
  total: number
  page: number
  pageSize: number
  search: string
  filterEstado: string | undefined
  filterPartido: number | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface VocaliaActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setSearch(search: string): Promise<void>
  setFilterEstado(estado: string | undefined): Promise<void>
  setFilterPartido(id: number | undefined): Promise<void>
  create(dto: CreateVocaliaDto): Promise<void>
  update(id: number, dto: UpdateVocaliaDto): Promise<void>
  remove(id: number): Promise<void>
  aprobar(id: number): Promise<void>
  rechazar(id: number, observaciones: string): Promise<void>
  sincronizarResultado(id: number): Promise<void>
  clearError(): void
}

export const useVocaliaStore = create<VocaliaState & VocaliaActions>(
  (set, get) => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    search: '',
    filterEstado: undefined,
    filterPartido: undefined,
    isLoading: false,
    isSaving: false,
    error: null,

    async load() {
      set({ isLoading: true, error: null })
      try {
        const { page, pageSize, search, filterEstado, filterPartido } = get()
        const result = await vocaliaUseCase.list({
          page,
          pageSize,
          search,
          estado: filterEstado,
          partido: filterPartido,
        })
        set({ items: result.results, total: result.count, isLoading: false })
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: e.detail ?? e.message ?? 'Error al cargar vocalías',
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

    async setFilterPartido(id) {
      set({ filterPartido: id, page: 1 })
      await get().load()
    },

    async create(dto) {
      set({ isSaving: true, error: null })
      try {
        await vocaliaUseCase.create(dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al crear vocalía',
        })
        throw err
      }
    },

    async update(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await vocaliaUseCase.update(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al actualizar vocalía',
        })
        throw err
      }
    },

    async remove(id) {
      set({ isSaving: true, error: null })
      try {
        await vocaliaUseCase.remove(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al eliminar vocalía',
        })
        throw err
      }
    },

    async aprobar(id) {
      set({ isSaving: true, error: null })
      try {
        await vocaliaUseCase.aprobar(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al aprobar',
        })
        throw err
      }
    },

    async rechazar(id, observaciones) {
      set({ isSaving: true, error: null })
      try {
        await vocaliaUseCase.rechazar(id, observaciones)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al rechazar',
        })
        throw err
      }
    },

    async sincronizarResultado(id) {
      set({ isSaving: true, error: null })
      try {
        await vocaliaUseCase.sincronizarResultado(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al sincronizar resultado',
        })
        throw err
      }
    },

    clearError() {
      set({ error: null })
    },
  }),
)
