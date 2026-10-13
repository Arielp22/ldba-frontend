import { create } from 'zustand'
import { userAdminUseCase } from '@/infrastructure/factories/user-admin.factory'
import type {
  UserAdmin,
  UserAdminStats,
} from '@/domain/entities/user-admin.entity'

interface UserAdminState {
  items: UserAdmin[]
  total: number
  page: number
  pageSize: number
  search: string
  filterStaff: boolean | undefined
  filterActive: boolean | undefined
  stats: UserAdminStats | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

interface UserAdminActions {
  load(): Promise<void>
  loadStats(): Promise<void>
  setPage(page: number): Promise<void>
  setSearch(search: string): Promise<void>
  setFilterStaff(value: boolean | undefined): Promise<void>
  setFilterActive(value: boolean | undefined): Promise<void>
  toggleActive(id: number): Promise<void>
  clearError(): void
}

export const useUserAdminStore = create<UserAdminState & UserAdminActions>(
  (set, get) => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    search: '',
    filterStaff: undefined,
    filterActive: undefined,
    stats: null,
    isLoading: false,
    isSaving: false,
    error: null,

    async load() {
      set({ isLoading: true, error: null })
      try {
        const { page, pageSize, search, filterStaff, filterActive } = get()
        const result = await userAdminUseCase.list({
          page,
          pageSize,
          search,
          is_staff: filterStaff,
          is_active: filterActive,
        })
        set({ items: result.results, total: result.count, isLoading: false })
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: e.detail ?? e.message ?? 'Error al cargar usuarios',
        })
      }
    },

    async loadStats() {
      try {
        const stats = await userAdminUseCase.stats()
        set({ stats })
      } catch {
        // silencioso
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

    async setFilterStaff(value) {
      set({ filterStaff: value, page: 1 })
      await get().load()
    },

    async setFilterActive(value) {
      set({ filterActive: value, page: 1 })
      await get().load()
    },

    async toggleActive(id) {
      set({ isSaving: true, error: null })
      try {
        await userAdminUseCase.toggleActive(id)
        set({ isSaving: false })
        await Promise.all([get().load(), get().loadStats()])
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string }
        set({
          isSaving: false,
          error: e.detail ?? e.message ?? 'Error al cambiar estado',
        })
        throw err
      }
    },

    clearError() {
      set({ error: null })
    },
  }),
)
