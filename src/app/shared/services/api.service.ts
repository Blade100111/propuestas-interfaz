import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * ApiService — capa de acceso HTTP genérica.
 *
 * Pendiente de conexión a backend real.  Los componentes actuales siguen usando
 * datos mock con setTimeout; este servicio provee la estructura lista para
 * reemplazarlos cuando los endpoints estén disponibles.
 *
 * La URL base se leerá de src/environments/environment.ts cuando se configure
 * el entorno de producción.  Hoy apunta a '/api' como marcador de posición.
 *
 * Endpoints documentados en:
 *   cumplidos_mf/MIGRATION_MAP.md  (paths y formatos de respuesta confirmados)
 *   cumplidos_mf/DIAGNOSTICO_ARQUITECTURA.md § 3 (integración con core_mf_cliente)
 */

const API_BASE = '/api'; // Reemplazar con environment.apiUrl en producción

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  get<T>(path: string, params?: Record<string, string | number>): Observable<T> {
    const httpParams = params
      ? new HttpParams({ fromObject: params as Record<string, string> })
      : undefined;
    return this.http.get<T>(`${API_BASE}${path}`, { params: httpParams });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${API_BASE}${path}`, body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${API_BASE}${path}`, body);
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${API_BASE}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${API_BASE}${path}`);
  }
}
