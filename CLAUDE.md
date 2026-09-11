# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200 (auto-reloads)
npm run build      # Production build → dist/
npm run watch      # Development build in watch mode
npm test           # Run unit tests with Vitest
```

Generate Angular artifacts:
```bash
ng generate component <name>
ng generate service <name>
ng generate --help   # Full list of schematics
```

## Architecture

This is an **Angular 21** micro-frontend built with `single-spa-angular`. It is intended to be composed into a larger shell application rather than run fully standalone. The `single-spa-angular` dependency (v21) drives the lifecycle hooks expected by the orchestrating shell.

**Key conventions:**
- **Standalone components only** — no NgModules. Every component declares its own `imports` array.
- **Signals** (`signal()`, `computed()`) are the preferred state primitive over RxJS `Subject`/`BehaviorSubject` for local component state.
- **Routing** is configured in `src/app/app.routes.ts` and provided via `provideRouter()` in `src/app/app.config.ts`.
- **Styling** uses **Tailwind CSS v4** (PostCSS plugin). Global styles live in `src/styles.css`; component-scoped styles use the `styleUrl` property.
- **Formatter**: Prettier — single quotes, 100-char print width, `angular` parser for `.html` files.
- **Test runner**: Vitest (via `@angular/build:unit-test` builder). Tests use Angular's `TestBed` API. Test files are colocated with source as `*.spec.ts`.
- Package manager is **npm** (v11.13.0); do not use yarn or pnpm.

## Contexto de negocio

Este proyecto es un **sandbox desechable** para validar propuestas de interfaz. Los datos que se muestran son hardcodeados; el código final vivirá en `cumplidos_mf`, no aquí.

Al escribir datos hardcodeados, usar los estados, roles y estructuras de datos reales del dominio:

- **Estados de `pago_mensual`**: `CD` → `PRS` → `AS` → `AP` (o `RS`/`RO` para rechazos)
- **Roles**: `CONTRATISTA`, `SUPERVISOR`, `ORDENADOR_DEL_GASTO`, `CONTROL_INTERNO`
- **Campos de auditoría en transiciones**: `CargoEjecutor` y `DocumentoEjecutor`, ambos truncados a 69 caracteres
- **"Sin resultados" del backend**: el API devuelve `Data: [{}]` (no `null` ni `[]`) cuando no hay datos

## Patrón conocido: stub → componente real requiere borrar el cache de Angular

Cuando un stub (template inline) se reemplaza por un componente real que usa `templateUrl`, el simple `Ctrl+C + npm start` NO es suficiente.

**Causa confirmada empíricamente**: `angular-compiler.db` (en `.angular/cache/`) es un cache persistente del compilador Angular. En WSL1 (entorno de este proyecto), los timestamps de inotify son poco confiables cuando un proceso externo escribe archivos — el DB puede conservar el output compilado del stub aunque los fuentes en disco sean correctos.

**Síntoma**: la ruta muestra el stub o una vista inesperada aunque `npm run build` compile limpio y el código fuente sea correcto. El texto del stub no aparece en ningún `grep` sobre `src/`.

**Diagnóstico empírico antes de tocar nada:**
```bash
# 1. Encontrar el chunk del componente en main.js
curl -s http://localhost:4200/main.js | strings | grep "informe\|chunk"
# 2. Verificar qué sirve realmente ese chunk
curl -s http://localhost:4200/<chunk-ID>.js | grep -o "MARCADOR\|stub text"
```
Si el chunk sirve el contenido nuevo → el problema es de **browser cache** (Ctrl+Shift+R, o Application→Clear site data en DevTools). No tocar el código.
Si el chunk sirve el contenido viejo → entonces borrar cache Angular y reiniciar:
```bash
rm -rf .angular/cache && npm start
```

**En `app.routes.ts`**: no dejar comentarios `// Stub — ...` una vez que el componente real fue construido. Son señal de alerta falsa que confunde en sesiones futuras.

## Documentos relacionados

Los documentos de referencia de negocio y arquitectura están en `cumplidos_mf`, el proyecto de producción al que este sandbox apunta. Consultar siempre que se necesite contexto sobre estados, roles, endpoints, flujos de trámite o decisiones de diseño ya resueltas:

- **`../../cumplidos_mf/DIAGNOSTICO_ARQUITECTURA.md`** — arquitectura objetivo del sistema: estructura de carpetas, capas, convenciones heredadas de los MFs hermanos, flujos operativos completos de los 6 trámites (carga de soportes, revisión supervisor, aprobación ordenador, reversión, histórico, parametrización de fechas), integración con `core_mf_cliente` y decisiones de diseño pendientes.

- **`../../cumplidos_mf/MIGRATION_MAP.md`** — mapa detallado de la migración AngularJS → Angular: inventario de controladores/servicios legacy, tabla de rutas, endpoints efectivamente consumidos por backend con sus paths y formatos de respuesta, y patrones recurrentes a abstraer (cambio de estado, carga de documentos, paginación, PDF).
