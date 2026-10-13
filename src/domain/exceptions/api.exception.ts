import { DomainException } from './domain.exception'

/**
 * Excepción que representa un error devuelto por la API remota.
 * Lanzada por los adapters de infrastructure/, capturada por application/ o presentation/.
 */
export class ApiException extends DomainException {
  /** Código de estado HTTP (p. ej. 400, 401, 403, 404, 500). */
  status: number
  /** Mensaje principal legible por el usuario. */
  detail: string
  /** Errores por campo del formulario (solo en 400 de validación). */
  fieldErrors?: Record<string, string[]>

  constructor(
    status: number,
    detail: string,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(detail)
    this.status = status
    this.detail = detail
    this.fieldErrors = fieldErrors
  }
}
