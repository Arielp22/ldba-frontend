import { create } from 'zustand'
import { partidoAdminUseCase } from '@/infrastructure/factories/partido-admin.factory'
import type {
  PartidoAdmin,
  SorteoVocaliasResponse,
} from '@/domain/entities/partido-admin.entity'
import type {
  CreatePartidoDto,
  UpdatePartidoDto,
  RegistrarResultadoDto,
} from '@/application/dtos/partido-admin.dto'

interface PartidoAdminState {
  items: PartidoAdmin[]
  total: number
  page: number
  pageSize: number
  filterJornada: number | undefined
  filterDia: string | undefined
  filterEstado: string | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
  /** Último resultado de sorteo (para mostrar en un toast) */
  ultimoSorteo: SorteoVocaliasResponse | null
}

interface PartidoAdminActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setFilterJornada(id: number | undefined): Promise<void>
  setFilterDia(dia: string | undefined): Promise<void>
  setFilterEstado(estado: string | undefined): Promise<void>
  create(dto: CreatePartidoDto): Promise<void>
  update(id: number, dto: UpdatePartidoDto): Promise<void>
  remove(id: number): Promise<void>
  registrarResultado(id: number, dto: RegistrarResultadoDto): Promise<void>
  sortearVocalias(jornadaId: number): Promise<SorteoVocaliasResponse>
  clearError(): void
  clearSorteo(): void
}

export const usePartidoAdminStore = create<
  PartidoAdminState & PartidoAdminActions
>((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  filterJornada: undefined,
  filterDia: undefined,
  filterEstado: undefined,
  isLoading: false,
  isSaving: false,
  error: null,
  ultimoSorteo: null,

  async load() {
    set({ isLoading: true, error: null })
    try {
      const { page, pageSize, filterJornada, filterDia, filterEstado } = get()
      const result = await partidoAdminUseCase.list({
        page,
        pageSize,
        jornada: filterJornada,
        dia: filterDia,
        estado: filterEstado,
      })
      set({ items: result.results, total: result.count, isLoading: false })
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isLoading: false,
        error: e.detail ?? e.message ?? 'Error al cargar partidos',
      })
    }
  },

  async setPage(page) {
    set({ page })
    await get().load()
  },

  async setFilterJornada(id) {
    set({ filterJornada: id, page: 1 })
    await get().load()
  },

  async setFilterDia(dia) {
    set({ filterDia: dia, page: 1 })
    await get().load()
  },

  async setFilterEstado(estado) {
    set({ filterEstado: estado, page: 1 })
    await get().load()
  },

  async create(dto) {
    set({ isSaving: true, error: null })
    try {
      await partidoAdminUseCase.create(dto)
      set({ isSaving: false })
      await get().load()
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al crear partido',
      })
      throw err
    }
  },

  async update(id, dto) {
    set({ isSaving: true, error: null })
    try {
      await partidoAdminUseCase.update(id, dto)
      set({ isSaving: false })
      await get().load()
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al actualizar partido',
      })
      throw err
    }
  },

  async remove(id) {
    set({ isSaving: true, error: null })
    try {
      await partidoAdminUseCase.remove(id)
      set({ isSaving: false })
      await get().load()
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al eliminar partido',
      })
      throw err
    }
  },

  async registrarResultado(id, dto) {
    set({ isSaving: true, error: null })
    try {
      await partidoAdminUseCase.registrarResultado(id, dto)
      set({ isSaving: false })
      await get().load()
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al registrar resultado',
      })
      throw err
    }
  },

  async sortearVocalias(jornadaId) {
    set({ isSaving: true, error: null, ultimoSorteo: null })
    try {
      const result = await partidoAdminUseCase.sortearVocalias(jornadaId)
      set({ isSaving: false, ultimoSorteo: result })
      await get().load()
      return result
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al sortear vocalías',
      })
      throw err
    }
  },

  clearError() {
    set({ error: null })
  },

  clearSorteo() {
    set({ ultimoSorteo: null })
  },
}))
