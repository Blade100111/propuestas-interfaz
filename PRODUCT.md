# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Cuatro roles del sistema de cumplidos de la Universidad Distrital Francisco José de Caldas:

- **CONTRATISTA** — contratista que sube sus soportes PDF de pago mensual y los envía a revisión.
- **SUPERVISOR** — revisa cumplidos pendientes, aprueba o rechaza, y parametriza ventanas de carga.
- **ORDENADOR_DEL_GASTO** — aprueba cumplidos individualmente o en masa, puede revertir aprobaciones.
- **CONTROL_INTERNO** — acceso de solo lectura al histórico multi-rol.

Los usuarios operan dentro del portal OAS de la Universidad Distrital. El layout (header, menú lateral, footer) lo provee `core_mf_cliente`; este proyecto solo implementa el área de contenido.

## Product Purpose

Sandbox desechable para prototipar y validar propuestas de interfaz del sistema de cumplidos mensuales de contratistas (Universidad Distrital) **antes** de implementar código de producción en `cumplidos_mf`. Los datos son hardcodeados. El código aquí no es código final.

El proceso que se prototipa: contratistas suben documentos de soporte de pago mensual → el supervisor los revisa y da visto bueno → el ordenador del gasto aprueba el pago. El sistema también cubre reversiones, histórico y parametrización de fechas de carga.

## Positioning

Permite al equipo técnico y a los stakeholders de negocio ver y aprobar la dirección de interfaz antes de que exista código de producción, eliminando el costo de rehacer UI en `cumplidos_mf`. Las propuestas se revisan primero internamente y luego se presentan a usuarios de negocio.

## Operating Context

- El sandbox vive dentro del micro-frontend `propuestas-interfaz`, compuesto con single-spa en el mismo shell que `cumplidos_mf`.
- El portal OAS provee el contenedor visual (header, menú lateral, footer). Las pantallas a prototipar son solo el área de contenido central.
- Los datos hardcodeados deben usar los estados, roles y estructuras reales del dominio (ver `CLAUDE.md → Contexto de negocio` y los archivos en `../../cumplidos_mf/`).
- Flujo de revisión: primero validación técnica interna → luego presentación a stakeholders de negocio para aprobación.
- Primera superficie a construir: **bandeja del contratista** (lista de contratos del mes, carga de soportes PDF, flujo `CD → PRS`).

## Capabilities and Constraints

- **Stack**: Angular 21 + single-spa-angular + Tailwind CSS v4. Sin Angular Material — solo HTML semántico + Tailwind.
- **Datos**: completamente hardcodeados; sin integración real con backends.
- **Layout shell**: no se reimplementa. El Core provee header, menú lateral y footer. El sandbox solo construye el contenido de las rutas.
- **Paleta**: subsistema GAIA, color primario rojo `#731514`. No usar la paleta URANO (`#03678F`) de los MFs del subsistema SGA.
- **Libertad visual**: dentro de las dos restricciones anteriores (GAIA + sin Angular Material), la dirección visual de las pantallas es libre.
- **Máquina de estados de `pago_mensual`**: `CD → PRS → AS → AP`; rechazos a `RS` (supervisor) o `RO` (ordenador).
- **Quirk del backend a reflejar en datos mock**: "sin resultados" se representa como `[{}]`, no como `[]`.
- **Campos de auditoría**: `CargoEjecutor` y `DocumentoEjecutor` truncados a 69 caracteres en transiciones de estado.

## Brand Commitments

- Subsistema **GAIA** — color primario `#731514` (rojo institucional).
- Universidad Distrital Francisco José de Caldas — portal OAS.
- Sin Bootstrap. Sin Angular Material. Sin paleta URANO.

## Evidence on Hand

- Diagnóstico completo del sistema legacy y arquitectura objetivo: `../../cumplidos_mf/DIAGNOSTICO_ARQUITECTURA.md`
- Mapa de migración con inventario de controladores, endpoints y patrones: `../../cumplidos_mf/MIGRATION_MAP.md`
- MFs de referencia del subsistema SGA (paleta distinta, pero patrones de código útiles): `seguimiento-comision`, `solicitud-comision`

## Product Principles

1. **El sandbox es la fuente de verdad de propuesta, no de producción.** Todo lo que aquí se valide debe poder trasladarse limpiamente a `cumplidos_mf`; si no puede, la propuesta falla.
2. **Los datos hardcodeados son reales en forma.** Estados, roles, campos y flujos deben coincidir con el dominio real para que las validaciones con stakeholders sean significativas.
3. **GAIA primero.** La paleta roja `#731514` no es opcional; es la identidad del subsistema en el que vive este módulo.
4. **El Core es el contenedor, no nosotros.** Ninguna pantalla reimplementa header, menú o footer; la interfaz comienza y termina en el área de contenido.
5. **Proponer con criterio, no con timidez.** El sandbox existe para explorar; una propuesta idéntica al legacy no aporta valor.
