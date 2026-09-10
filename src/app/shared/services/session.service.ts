import { Injectable, signal } from '@angular/core';

export interface UsuarioSesion {
  nombre: string;
  documento: string;
}

/**
 * SessionService — información básica de la sesión del contratista autenticado.
 *
 * Pendiente de integración con el flujo OAuth2 del shell application.
 * En producción, el shell inyectará los datos del token JWT / sesión via un
 * evento o shared state de single-spa.  Ver DIAGNOSTICO_ARQUITECTURA.md § 3.
 *
 * Hoy devuelve datos mock que coinciden con los valores hardcodeados
 * actualmente en los templates — sin cambio visible al usuario.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  // En producción: leer del token JWT descifrado que inyecta el shell.
  private readonly _usuario = signal<UsuarioSesion>({
    nombre: 'María García',
    documento: '51.234.567',
  });

  /** Señal de solo lectura expuesta a los componentes. */
  readonly usuario = this._usuario.asReadonly();

  /**
   * Reemplazar en producción con la llamada al endpoint de sesión o con la
   * lectura del token que provee el shell de single-spa.
   */
  setUsuario(u: UsuarioSesion): void {
    this._usuario.set(u);
  }
}
