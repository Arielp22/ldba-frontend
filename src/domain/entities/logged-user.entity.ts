/**
 * Usuario autenticado tal como lo devuelve /auth/login/, /auth/me/
 * o /users/profile/.
 *
 * `groups` es la lista de nombres de los grupos/comisiones a los que
 * pertenece el usuario (ej. "Superadmin", "Comision Tecnica").
 */
export interface LoggedUser {
  user_id: number
  username: string
  email: string
  is_staff: boolean
  is_superuser: boolean
  groups: string[]
}
