import { AxiosDocumentoRepository } from '@/infrastructure/adapters/axios-documento.repository'
import { DocumentoUseCase } from '@/application/use-cases/documento.use-case'

export const documentoUseCase = new DocumentoUseCase(
  new AxiosDocumentoRepository(),
)
