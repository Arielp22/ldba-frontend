import { create } from 'zustand'
import { documentoUseCase } from '@/infrastructure/factories/documento.factory'
import type { Documento } from '@/domain/entities/documento.entity'
import type {
  CreateDocumentoDto,
  UpdateDocumentoDto,
} from '@/application/dtos/documento.dto'

interface DocumentoState {
  items: Documento[]
  total: number
  page: number
  pageSize: number
  search: string
  filterTipo: string | undefined
  filterJugador: number | undefined
  filterEquipo: number | undefined
  filterSesion: number | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface DocumentoActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setSearch(search: string): Promise<void>
  setFilterTipo(tipo: string | undefined): Promise<void>
  setFilterJugador(id: number | undefined): Promise<void>
  setFilterEquipo(id: number | undefined): Promise<void>
  setFilterSesion(id: number | undefined): Promise<void>
  create(dto: CreateDocumentoDto): Promise<void>
  update(id: number, dto: UpdateDocumentoDto): Promise<void>
  remove(id: number): Promise<void>
  clearError(): void
}

export const useDocumentoStore = create<DocumentoState & DocumentoActions>(
  (set, get) => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    search: '',
    filterTipo: undefined,
    filterJugador: undefined,
    filterEquipo: undefined,
    filterSesion: undefined,
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
          filterTipo,
          filterJugador,
          filterEquipo,
          filterSesion,
        } = get()
        const result = await documentoUseCase.list({
          page,
          pageSize,
          search,
          tipo: filterTipo,
          jugador: filterJugador,
          equipo: filterEquipo,
          sesion: filterSesion,
        })
        set({ items: result.results, total: result.count, isLoading: false })
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: e.detail ?? e.message ?? 'Error al cargar documentos',
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

    async setFilterJugador(id) {
      set({ filterJugador: id, page: 1 })
      await get().load()
    },

    async setFilterEquipo(id) {
      set({ filterEquipo: id, page: 1 })
      await get().load()
    },

    async setFilterSesion(id) {
      set({ filterSesion: id, page: 1 })
      await get().load()
    },

    async create(dto) {
      set({ isSaving: true, error: null })
      try {
        await documentoUseCase.create(dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al crear documento',
        })
        throw err
      }
    },

    async update(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await documentoUseCase.update(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al actualizar documento',
        })
        throw err
      }
    },

    async remove(id) {
      set({ isSaving: true, error: null })
      try {
        await documentoUseCase.remove(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al eliminar documento',
        })
        throw err
      }
    },

    clearError() {
      set({ error: null })
    },
  }),
)
