/**
 * Constantes de estado del flujo pago_mensual compartidas entre las pantallas
 * del rol CONTRATISTA.  Exportadas desde shared/ para evitar que el mismo
 * Record se redefina en detalle-soporte, solicitudes e informe.
 *
 * Estados: CD → PRS → AS → AP; rechazos: RS (supervisor) · RO (ordenador).
 * Colores: ver GAIA color rules en CLAUDE.md — no cambiar sin actualizar también
 * los chips que usan bg-[#930E10], bg-[#FF9311], etc.
 */
export interface EstadoConfig {
  label: string;
  /** Tailwind color classes (bg + text) — literal strings para que el scanner las incluya. */
  chipClass: string;
}

export const ESTADO_CONFIG: Record<string, EstadoConfig> = {
  CD:  { label: 'Creado',           chipClass: 'bg-[#FF9311] text-gray-900' },
  PRS: { label: 'En revisión',      chipClass: 'bg-[#FFB051] text-gray-900' },
  AS:  { label: 'Aprobado Sup.',    chipClass: 'bg-[#218B22] text-white'    },
  AP:  { label: 'Aprobado',         chipClass: 'bg-[#218B22] text-white'    },
  RS:  { label: 'Rechazado Sup.',   chipClass: 'bg-[#930E10] text-white'    },
  RO:  { label: 'Rechazado Ord.',   chipClass: 'bg-gray-500 text-white'     },
};

/**
 * Prioridad de ordenamiento para listas de solicitudes.
 * CD primero (acción pendiente) → AP/RO al final (terminales).
 */
export const SORT_PRIORITY: Record<string, number> = {
  CD: 1, RS: 2, PRS: 3, AS: 4, AP: 5, RO: 6,
};
