/**
 * Fuente de verdad para el ancho máximo de contenedor de contenido.
 *
 * Pantallas anchas (max-w-7xl): contratos, solicitudes, informe
 * Pantalla estrecha (max-w-3xl): detalle-soporte
 *
 * Uso en componentes:
 *   import { MAIN_WIDE, HDR_WIDE } from '../../shared/layout';
 *   readonly mainCls = MAIN_WIDE;
 *   readonly hdrCls  = HDR_WIDE;
 *
 * En la plantilla: [class]="mainCls" / [class]="hdrCls"
 */

/** Clase para <main> en pantallas anchas. */
export const MAIN_WIDE = 'mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8';

/** Clase para <main> en pantalla estrecha (detalle-soporte). */
export const MAIN_NARROW = 'mx-auto max-w-3xl px-4 py-6 sm:px-6';

/** Clase para el div interior dentro de <header> en pantallas anchas. */
export const HDR_WIDE = 'mx-auto max-w-7xl py-6';

/** Clase para el div interior dentro de <header> en pantalla estrecha. */
export const HDR_NARROW = 'mx-auto max-w-3xl py-6';
