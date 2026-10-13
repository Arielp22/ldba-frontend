import { create } from 'zustand'
import { noticiaUseCase } from '@/infrastructure/factories/noticia.factory'
import type { Noticia } from '@/domain/entities/noticia.entity'
import type {
  CreateNoticiaDto,
  UpdateNoticiaDto,
} from '@/application/dtos/noticia.dto'

interface NoticiaState {
  items: Noticia[]
  total: number
  page: number
  pageSize: number
  search: string
  filterPublicada: boolean | undefined
  filterDestacada: boolean | undefined
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface NoticiaActions {
  load(): Promise<void>
  setPage(page: number): Promise<void>
  setSearch(search: string): Promise<void>
  setFilterPublicada(publicada: boolean | undefined): Promise<void>
  setFilterDestacada(destacada: boolean | undefined): Promise<void>
  create(dto: CreateNoticiaDto): Promise<void>
  update(id: number, dto: UpdateNoticiaDto): Promise<void>
  remove(id: number): Promise<void>
  publicar(id: number): Promise<void>
  despublicar(id: number): Promise<void>
  clearError(): void
}

export const useNoticiaStore = create<NoticiaState & NoticiaActions>(
  (set, get) => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    search: '',
    filterPublicada: undefined,
    filterDestacada: undefined,
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
          filterPublicada,
          filterDestacada,
        } = get()
        const result = await noticiaUseCase.list({
          page,
          pageSize,
          search,
          publicada: filterPublicada,
          destacada: filterDestacada,
        })
        set({ items: result.results, total: result.count, isLoading: false })
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: e.detail ?? e.message ?? 'Error al cargar noticias',
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

    async setFilterPublicada(publicada) {
      set({ filterPublicada: publicada, page: 1 })
      await get().load()
    },

    async setFilterDestacada(destacada) {
      set({ filterDestacada: destacada, page: 1 })
      await get().load()
    },

    async create(dto) {
      set({ isSaving: true, error: null })
      try {
        await noticiaUseCase.create(dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al crear noticia',
        })
        throw err
      }
    },

    async update(id, dto) {
      set({ isSaving: true, error: null })
      try {
        await noticiaUseCase.update(id, dto)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al actualizar noticia',
        })
        throw err
      }
    },

    async remove(id) {
      set({ isSaving: true, error: null })
      try {
        await noticiaUseCase.remove(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al eliminar noticia',
        })
        throw err
      }
    },

    async publicar(id) {
      set({ isSaving: true, error: null })
      try {
        await noticiaUseCase.publicar(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al publicar',
        })
        throw err
      }
    },

    async despublicar(id) {
      set({ isSaving: true, error: null })
      try {
        await noticiaUseCase.despublicar(id)
        set({ isSaving: false })
        await get().load()
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al despublicar',
        })
        throw err
      }
    },

    clearError() {
      set({ error: null })
    },
  }),
)
