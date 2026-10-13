export interface CreateSesionParticipanteDto {
  sesion: number
  nombre: string
  cargo?: string
  presente?: boolean
  observaciones?: string
}

export interface UpdateSesionParticipanteDto {
  nombre?: string
  cargo?: string
  presente?: boolean
  observaciones?: string
}
