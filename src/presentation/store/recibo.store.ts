import { create } from 'zustand'
import { reciboUseCase } from '@/infrastructure/factories/recibo.factory'
import type { Recibo } from '@/domain/entities/recibo.entity'
import type {
  CreateReciboDto,
  UpdateReciboDto,
} from '@/application/dtos/recibo.dto'

interface ReciboState {
  items: Recibo[]
  total: number
  page: number
  pageSize: number
  search: string
  filterMulta: number | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface ReciboActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setSearch(search: string): Promise<void>
  setFilterMulta(id: number | undefined): Promise<void>
  create(dto: CreateReciboDto): Promise<void>
  update(id: number, dto: UpdateReciboDto): Promise<void>
  remove(id: number): Promise<void>
  clearError(): void
}

export const useReciboStore = create<ReciboState & ReciboActions>(
  (set, get) => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    search: '',
    filterMulta: undefined,
    isLoading: false,
    isSaving: false,
    error: null,

    async load() {
      set({ isLoading: true, error: null })
      try {
        const { page, pageSize, search, filterMulta } = get()
        const result = await reciboUseCase.list({
          page,
          pageSize,
          search,
          multa: filterMulta,
        })
        set({ items: result.results, total: result.count, isLoading: false })
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: e.detail ?? e.message ?? 'Error al cargar recibos',
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

    async setFilterMulta(id) {
      set({ filterMulta: id, page: 1 })
      await get().load()
    },

    async create(dto) {
      set({ isSaving: true, error: null })
      try {
        await reciboUseCase.create(dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al crear recibo',
        })
        throw err
      }
    },

    async update(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await reciboUseCase.update(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al actualizar recibo',
        })
        throw err
      }
    },

    async remove(id) {
      set({ isSaving: true, error: null })
      try {
        await reciboUseCase.remove(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al eliminar recibo',
        })
        throw err
      }
    },

    clearError() {
      set({ error: null })
    },
  }),
)
