import { create } from 'zustand'
import { informeFinancieroUseCase } from '@/infrastructure/factories/informe-financiero.factory'
import type { InformeFinancieroSemanal } from '@/domain/entities/informe-financiero.entity'
import type {
  CreateInformeDto,
  UpdateInformeDto,
} from '@/application/dtos/informe-financiero.dto'

interface InformeState {
  items: InformeFinancieroSemanal[]
  total: number
  page: number
  pageSize: number
  search: string
  filterEstado: string | undefined
  filterAnio: number | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface InformeActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setSearch(search: string): Promise<void>
  setFilterEstado(estado: string | undefined): Promise<void>
  setFilterAnio(anio: number | undefined): Promise<void>
  create(dto: CreateInformeDto): Promise<void>
  update(id: number, dto: UpdateInformeDto): Promise<void>
  remove(id: number): Promise<void>
  clearError(): void
}

export const useInformeFinancieroStore = create<
  InformeState & InformeActions
>((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  search: '',
  filterEstado: undefined,
  filterAnio: undefined,
  isLoading: false,
  isSaving: false,
  error: null,

  async load() {
    set({ isLoading: true, error: null })
    try {
      const { page, pageSize, search, filterEstado, filterAnio } = get()
      const result = await informeFinancieroUseCase.list({
        page,
        pageSize,
        search,
        estado: filterEstado,
        anio: filterAnio,
      })
      set({ items: result.results, total: result.count, isLoading: false })
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isLoading: false,
        error: e.detail ?? e.message ?? 'Error al cargar informes',
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

  async setFilterAnio(anio) {
    set({ filterAnio: anio, page: 1 })
    await get().load()
  },

  async create(dto) {
    set({ isSaving: true, error: null })
    try {
      await informeFinancieroUseCase.create(dto)
      set({ isSaving: false })
      await get().load()
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al crear informe',
      })
      throw err
    }
  },

  async update(id, dto) {
    set({ isSaving: true, error: null })
    try {
      await informeFinancieroUseCase.update(id, dto)
      set({ isSaving: false })
      await get().load()
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al actualizar informe',
      })
      throw err
    }
  },

  async remove(id) {
    set({ isSaving: true, error: null })
    try {
      await informeFinancieroUseCase.remove(id)
      set({ isSaving: false })
      await get().load()
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al eliminar informe',
      })
      throw err
    }
  },

  clearError() {
    set({ error: null })
  },
}))
