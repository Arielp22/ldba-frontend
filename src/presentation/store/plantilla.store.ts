import { create } from 'zustand'
import { plantillaUseCase } from '@/infrastructure/factories/plantilla.factory'
import type { Plantilla } from '@/domain/entities/plantilla.entity'
import type { CreatePlantillaDto } from '@/application/dtos/plantilla.dto'

interface PlantillaState {
  items: Plantilla[]
  total: number
  page: number
  pageSize: number
  filterTemporada: number | undefined
  filterCategoria: number | undefined
  filterEquipo: number | undefined
  filterActivo: boolean | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface PlantillaActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setFilterTemporada(id: number | undefined): Promise<void>
  setFilterCategoria(id: number | undefined): Promise<void>
  setFilterEquipo(id: number | undefined): Promise<void>
  setFilterActivo(value: boolean | undefined): Promise<void>
  create(dto: CreatePlantillaDto): Promise<void>
  update(id: number, dto: Partial<CreatePlantillaDto>): Promise<void>
  remove(id: number): Promise<void>
  clearError(): void
}

export const usePlantillaStore = create<PlantillaState & PlantillaActions>(
  (set, get) => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    filterTemporada: undefined,
    filterCategoria: undefined,
    filterEquipo: undefined,
    filterActivo: undefined,
    isLoading: false,
    isSaving: false,
    error: null,

    async load() {
      set({ isLoading: true, error: null })
      try {
        const {
          page,
          pageSize,
          filterTemporada,
          filterCategoria,
          filterEquipo,
          filterActivo,
        } = get()
        const result = await plantillaUseCase.list({
          page,
          pageSize,
          temporada: filterTemporada,
          categoria: filterCategoria,
          equipo: filterEquipo,
          activo: filterActivo,
        })
        set({ items: result.results, total: result.count, isLoading: false })
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: e.detail ?? e.message ?? 'Error al cargar plantillas',
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

    async setFilterEquipo(id) {
      set({ filterEquipo: id, page: 1 })
      await get().load()
    },

    async setFilterActivo(value) {
      set({ filterActivo: value, page: 1 })
      await get().load()
    },

    async create(dto) {
      set({ isSaving: true, error: null })
      try {
        await plantillaUseCase.create(dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al crear plantilla',
        })
        throw err
      }
    },

    async update(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await plantillaUseCase.update(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al actualizar plantilla',
        })
        throw err
      }
    },

    async remove(id) {
      set({ isSaving: true, error: null })
      try {
        await plantillaUseCase.remove(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al eliminar plantilla',
        })
        throw err
      }
    },

    clearError() {
      set({ error: null })
    },
  }),
)
