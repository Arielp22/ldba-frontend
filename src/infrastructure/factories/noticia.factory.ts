import { AxiosNoticiaRepository } from '@/infrastructure/adapters/axios-noticia.repository'
import { NoticiaUseCase } from '@/application/use-cases/noticia.use-case'

export const noticiaUseCase = new NoticiaUseCase(new AxiosNoticiaRepository())
