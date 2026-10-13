export interface SesionParticipante {
  id: number
  sesion: number
  nombre: string
  cargo: string | null
  presente: boolean
  observaciones: string | null
  created_at: string
}
