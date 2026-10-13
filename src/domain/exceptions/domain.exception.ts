/**
 * Excepción base de la capa de dominio. No depende de Axios, HTTP,
 * ni de ningún detalle de infraestructura — es TypeScript puro.
 */
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message)
    this.name = new.target.name
  }
}
