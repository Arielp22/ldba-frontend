export interface CreateVocaliaDto {
  partido?: number | null
  arbitro: string
  vocal: string
  goles_local?: number | null
  goles_visitante?: number | null
  informe?: string
  firma_arbitro?: string
  firma_vocal?: string
  estado?: string
}

export interface UpdateVocaliaDto {
  arbitro?: string
  vocal?: string
  goles_local?: number | null
  goles_visitante?: number | null
  informe?: string
  firma_arbitro?: string
  firma_vocal?: string
  estado?: string
}
