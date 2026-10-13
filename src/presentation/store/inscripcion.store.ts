import { create } from 'zustand'
import { inscripcionUseCase } from '@/infrastructure/factories/inscripcion.factory'
import type { Inscripcion } from '@/domain/entities/inscripcion.entity'
import type { CreateInscripcionDto } from '@/application/dtos/inscripcion.dto'

interface InscripcionState {
  items: Inscripcion[]
  total: number
  page: number
  pageSize: number
  filterTemporada: number | undefined
  filterCategoria: number | undefined
  filterActivo: boolean | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface InscripcionActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setFilterTemporada(id: number | undefined): Promise<void>
  setFilterCategoria(id: number | undefined): Promise<void>
  setFilterActivo(value: boolean | undefined): Promise<void>
  create(dto: CreateInscripcionDto): Promise<void>
  update(id: number, dto: Partial<CreateInscripcionDto>): Promise<void>
  remove(id: number): Promise<void>
  clearError(): void
}

export const useInscripcionStore = create<
  InscripcionState & InscripcionActions
>((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  filterTemporada: undefined,
  filterCategoria: undefined,
  filterActivo: undefined,
  isLoading: false,
  isSaving: false,
  error: null,

  async load() {
    set({ isLoading: true, error: null })
    try {
      const { page, pageSize, filterTemporada, filterCategoria, filterActivo } =
        get()
      const result = await inscripcionUseCase.list({
        page,
        pageSize,
        temporada: filterTemporada,
        categoria: filterCategoria,
        activo: filterActivo,
      })
      set({ items: result.results, total: result.count, isLoading: false })
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isLoading: false,
        error: e.detail ?? e.message ?? 'Error al cargar inscripciones',
      })
    }
  },

  async setPage(page) {
    set({ page })
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

  async setFilterActivo(value) {
    set({ filterActivo: value, page: 1 })
    await get().load()
  },

  async create(dto) {
    set({ isSaving: true, error: null })
    try {
      await inscripcionUseCase.create(dto)
      set({ isSaving: false })
      await get().load()
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al crear inscripción',
      })
      throw err
    }
  },

  async update(id, dto) {
    set({ isSaving: true, error: null })
    try {
      await inscripcionUseCase.update(id, dto)
      set({ isSaving: false })
      await get().load()
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al actualizar inscripción',
      })
      throw err
    }
  },

  async remove(id) {
    set({ isSaving: true, error: null })
    try {
      await inscripcionUseCase.remove(id)
      set({ isSaving: false })
      await get().load()
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      set({
        isSaving: false,
        error: e.detail ?? e.message ?? 'Error al eliminar inscripción',
      })
      throw err
    }
  },

  clearError() {
    set({ error: null })
  },
}))
