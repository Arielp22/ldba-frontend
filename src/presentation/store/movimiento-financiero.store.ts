import { create } from 'zustand'
import { movimientoFinancieroUseCase } from '@/infrastructure/factories/movimiento-financiero.factory'
import type {
  MovimientoFinanciero,
  MovimientoResumen,
} from '@/domain/entities/movimiento-financiero.entity'
import type {
  CreateMovimientoDto,
  UpdateMovimientoDto,
} from '@/application/dtos/movimiento-financiero.dto'

interface MovimientoState {
  items: MovimientoFinanciero[]
  total: number
  page: number
  pageSize: number
  search: string
  filterTipo: string | undefined
  filterFecha: string | undefined
  resumen: MovimientoResumen | null
  isLoading: boolean
  isLoadingResumen: boolean
  isSaving: boolean
  error: string | null
}

interface MovimientoActions {
  load(): Promise<void>
  loadResumen(): Promise<void>
  setPage(page: number): Promise<void>
  setSearch(search: string): Promise<void>
  setFilterTipo(tipo: string | undefined): Promise<void>
  setFilterFecha(fecha: string | undefined): Promise<void>
  create(dto: CreateMovimientoDto): Promise<void>
  update(id: number, dto: UpdateMovimientoDto): Promise<void>
  remove(id: number): Promise<void>
  clearError(): void
}

export const useMovimientoFinancieroStore = create<
  MovimientoState & MovimientoActions
>((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  search: '',
  filterTipo: undefined,
  filterFecha: undefined,
  resumen: null,
  isLoading: false,
  isLoadingResumen: false,
  isSaving: false,
  error: null,

  async load() {
    set({ isLoading: true, error: null })
    try {
      const { page, pageSize, search, filterTipo, filterFecha } = get()
      const result = await movimientoFinancieroUseCase.list({
        page,
        pageSize,
        search,
        tipo: filterTipo,
        fecha: filterFecha,
      })
      set({ items: result.results, total: result.count, isLoading: false })
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isLoading: false,
        error: e.detail ?? e.message ?? 'Error al cargar movimientos',
      })
    }
  },

  async loadResumen() {
    set({ isLoadingResumen: true })
    try {
      const { filterTipo, filterFecha } = get()
      const resumen = await movimientoFinancieroUseCase.resumen({
        tipo: filterTipo,
        fecha: filterFecha,
      })
      set({ resumen, isLoadingResumen: false })
    } catch {
      set({ isLoadingResumen: false })
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
    await Promise.all([get().load(), get().loadResumen()])
  },

  async setFilterFecha(fecha) {
    set({ filterFecha: fecha, page: 1 })
    await Promise.all([get().load(), get().loadResumen()])
  },

  async create(dto) {
    set({ isSaving: true, error: null })
    try {
      await movimientoFinancieroUseCase.create(dto)
      set({ isSaving: false })
      await Promise.all([get().load(), get().loadResumen()])
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al crear movimiento',
      })
      throw err
    }
  },

  async update(id, dto) {
    set({ isSaving: true, error: null })
    try {
      await movimientoFinancieroUseCase.update(id, dto)
      set({ isSaving: false })
      await Promise.all([get().load(), get().loadResumen()])
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al actualizar movimiento',
      })
      throw err
    }
  },

  async remove(id) {
    set({ isSaving: true, error: null })
    try {
      await movimientoFinancieroUseCase.remove(id)
      set({ isSaving: false })
      await Promise.all([get().load(), get().loadResumen()])
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al eliminar movimiento',
      })
      throw err
    }
  },

  clearError() {
    set({ error: null })
  },
}))
