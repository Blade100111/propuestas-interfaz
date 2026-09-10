/**
 * generar-certificado.ts
 *
 * Genera el PDF "Certificado de Cumplimiento e Informe de Gestión" con pdfmake 0.3.x.
 * Reproduce la estructura del documento legacy PEI-PR-003-FR-009 que el sistema
 * cumplidos_cliente generaba con pdfmakeoas@0.0.2.
 *
 * DATOS NO DISPONIBLES EN EL SANDBOX (requieren API / sesión en producción):
 *   - Nombre y documento del contratista  → perfil sesión OAuth2
 *   - Dependencia / Sede                  → API de contratos
 *   - CDP / RP                            → API cumplidosCrud (preliquidación)
 *   - Valor total y ejecución financiera  → API cumplidosCrud (preliquidación)
 * Los campos anteriores se muestran como marcadores explícitos en el PDF del sandbox.
 */

// Default import preserves `this` binding on pdfmake class instance methods.
import pdfMake from 'pdfmake';

// pdfmake font packages have no type declarations — @ts-ignore is intentional.
// RobotoFontContainer exposes { vfs, fonts } — la fuente TTF embebida que usa el legacy
// (pdfmakeoas@0.0.2 incluía Roboto por defecto; replicamos eso aquí).
// addFontContainer carga VFS + alias en un paso.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import RobotoFontContainer from 'pdfmake/build/fonts/Roboto';

import type { InformeData, ActividadItem } from './informe-contratista.component';
import type { DetalleContrato } from '../detalle-soporte/detalle-soporte-contratista.component';
import { LOGO_UD, LOGO_SIGUD } from './logos';

// ── Helpers ───────────────────────────────────────────────────────────────────

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** DD/MM/YYYY — fechas cortas internas */
function fmt(fechaIso: string): string {
  if (!fechaIso) return '—';
  const parts = fechaIso.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/** "del D de Mes de YYYY" — formato largo igual al legacy `utils.formatoFecha()` */
function fmtLargo(fechaIso: string): string {
  if (!fechaIso) return '—';
  const parts = fechaIso.split('-');
  const dia   = parseInt(parts[2], 10);
  const mes   = parseInt(parts[1], 10);
  const anio  = parseInt(parts[0], 10);
  return `del ${dia} de ${MESES[mes - 1]} de ${anio}`;
}

function hdr(text: string): object {
  return { text, bold: true, fillColor: '#CCCCCC', fontSize: 11, margin: [0, 3, 0, 0] };
}

function cel(text: string, fontSize = 11): object {
  return { text, fontSize, margin: [0, 5, 0, 0] };
}

/**
 * Construye el body de la tabla de actividades replicando construirTabla() del legacy.
 * Cada ActividadEspecifica puede tener N ActividadesRealizadas;
 * se usa rowSpan en las columnas No./Actividad/Avance para el primer sub-row del grupo.
 *
 * Evidencias (Issue 1 — verificado contra crear_lista_evidencias() del legacy):
 *   tipo 'enlace' → texto "Evidencia N" con link, azul subrayado (igual al urlRegex branch)
 *   tipo 'texto'  → texto en itálicas (igual al texto plano branch)
 */
function construirTablaActividades(actividades: ActividadItem[]): object[][] {
  const body: object[][] = [];

  body.push([
    { text: 'No.',                                               style: 'actividadesHeader' },
    { text: 'ACTIVIDADES ESPECÍFICAS DEL VÍNCULO CONTRACTUAL',  style: 'actividadesHeader' },
    { text: 'PORCENTAJE DE AVANCE',                             style: 'actividadesHeader' },
    { text: 'ACTIVIDADES REALIZADAS EN EL PERÍODO',             style: 'actividadesHeader' },
    { text: 'PRODUCTO ASOCIADO',                                style: 'actividadesHeader' },
    { text: 'EVIDENCIAS',                                       style: 'actividadesHeader' },
  ]);

  let rowIdx = 1;

  for (let i = 0; i < actividades.length; i++) {
    const act = actividades[i];
    const realizadas = act.actividadesRealizadas.filter((ar) => ar.activo);
    const count = Math.max(realizadas.length, 1);

    for (let j = 0; j < count; j++) {
      const ar = realizadas[j];

      // Evidencias — replicando create_lista_evidencias() del legacy:
      //   URL → "Evidencia N" azul con link (aquí: tipo 'enlace')
      //   texto plano → itálicas (aquí: tipo 'texto')
      const evidenciasStack = ar
        ? ar.evidencias.map((ev, evIdx) => {
            const content =
              ev.tipo === 'enlace'
                ? {
                    width: '*',
                    text: `Evidencia ${evIdx + 1}`,
                    link: ev.valor,
                    color: '#0645AD',
                    decoration: 'underline',
                    bold: true,
                    margin: [0, 0, 0, 2],
                    style: 'actividadesText',
                  }
                : {
                    width: '*',
                    text: ev.valor,
                    italics: true,
                    margin: [0, 0, 0, 2],
                    style: 'actividadesText',
                  };
            return {
              columns: [
                { width: 8, text: '\u2022', margin: [0, 1, 0, 0] },
                content,
              ],
              columnGap: 2,
            };
          })
        : [];

      body.push([
        {},
        {},
        {},
        ar ? { text: ar.actividad,        style: 'actividadesText' } : { text: '' },
        ar ? { text: ar.productoAsociado, style: 'actividadesText' } : { text: '' },
        ar ? { stack: evidenciasStack }                              : { text: '' },
      ]);
    }

    body[rowIdx][0] = { rowSpan: count, text: String(i + 1), bold: true, alignment: 'center', style: 'actividadesText' };
    body[rowIdx][1] = { rowSpan: count, text: act.actividadEspecifica || '—',                 style: 'actividadesText' };
    body[rowIdx][2] = { rowSpan: count, text: `${act.avance}%`, alignment: 'center',          style: 'actividadesText' };

    rowIdx += count;
  }

  return body;
}

// ── Nombre del archivo de descarga ────────────────────────────────────────────

export function buildFilename(informe: InformeData): string {
  return `certificado-cumplido-${informe.numeroContrato.replace('/', '-')}-${informe.mes}-${informe.ano}.pdf`;
}

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Construye y devuelve el documento pdfmake (TCreatedPdf) listo para
 * getDataUrl() o download().  El llamador decide si descarga directamente
 * o muestra un visor previo (Issue 7 — patrón del legacy).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function crearCertificadoPDF(
  informe: InformeData,
  detalle: DetalleContrato | null,
  proceso: string,
  periodoInicio: string,
  periodoFin: string,
  actividades: ActividadItem[],
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const supervisor = detalle?.supervisor ?? '—';

  pdfMake.addFontContainer(RobotoFontContainer);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docDefinition: any = {
    pageSize:        'FOLIO',
    pageOrientation: 'landscape',
    pageMargins:     [10, 10, 10, 10],

    // Legacy (pdfmakeoas@0.0.2) usaba Roboto por defecto sin declararlo explícitamente.
    // Lo declaramos aquí para garantizar que pdfmake@0.3.x lo use igual.
    defaultStyle: { font: 'Roboto', fontSize: 10 },

    content: [

      // ── 1. Encabezado institucional ────────────────────────────────────────
      // Issue 6: logos reales base64 extraídos del legacy (mismo que el PDF real).
      // Legacy: { rowSpan:3, image:'logo_ud', width:70, height:60 }
      {
        style: 'tableHeader',
        table: {
          widths: ['*', 'auto', 'auto', '*'],
          heights: 19,
          headerRows: 1,
          body: [
            [
              { rowSpan: 3, image: 'logo_ud',   width: 70,  height: 60 },
              { text: 'CERTIFICADO DE CUMPLIMIENTO E INFORME DE GESTIÓN', bold: true, margin: [0, 2, 0, 0] },
              { text: 'Código: PEI-PR-003-FR-009',                         margin: [0, 3, 0, 0] },
              { rowSpan: 3, image: 'logo_sigud', width: 150, height: 60 },
            ],
            ['', { text: 'Macroproceso: Direccionamiento Estratégico',                     margin: [0, 3, 0, 0] }, { text: 'Versión: 02',                      margin: [0, 3, 0, 0] }, ''],
            ['', { text: 'Proceso: Planeación Estratégica e Institucional', margin: [22, 3, 0, 0] }, { text: 'Fecha de Aprobación: 14/03/2022', margin: [35, 3, 0, 0] }, ''],
          ],
        },
      },

      // ── 2. Número de contrato ──────────────────────────────────────────────
      // Issue 4: la 4ª celda lleva el formato largo "del D de Mes de YYYY"
      // igual al utils.formatoFecha() del legacy (FechaCPS → sandbox: fechaInicio).
      {
        columns: [
          { width: 125, text: '' },
          {
            style: 'tableContractInfo',
            width: '*',
            table: {
              widths: ['auto', 'auto', 'auto', '*'],
              heights: 19,
              body: [[
                hdr('CONTRATO DE PRESTACIÓN DE SERVICIOS'),
                hdr('C.P.S. No.'),
                cel(informe.numeroContrato),
                cel(fmtLargo(informe.fechaInicio)),
              ]],
            },
          },
          { width: 152, text: '' },
        ],
      },

      // ── 3. Información contractual ─────────────────────────────────────────
      // Issue 2: se agrega la 5ª fila CDP/RP (línea 951 del legacy).
      // CDP y RP vienen de la API de preliquidación; en el sandbox se usa placeholder.
      {
        style: 'tableContractInfo',
        table: {
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
          body: [
            [
              hdr('NOMBRE CONTRATISTA:'),
              { colSpan: 2, ...cel('(nombre del contratista — dato de sesión OAuth2)') },
              {},
              hdr('FECHA DE INICIO'),
              cel(fmt(informe.fechaInicio)),
              hdr('FECHA FINALIZACIÓN:'),
              cel(fmt(informe.fechaFin)),
            ],
            [
              hdr('PROCESO:'),
              { colSpan: 6, ...cel(proceso || '—') },
              {}, {}, {}, {}, {},
            ],
            [
              hdr('UNIDAD ACADÉMICA Y/O ADMINISTRATIVA:'),
              { colSpan: 6, ...cel('(dependencia — disponible en producción vía API contractual)') },
              {}, {}, {}, {}, {},
            ],
            [
              hdr('SEDE:'),
              cel('—'),
              hdr('PERÍODO INFORME:'),
              hdr('DESDE:'),
              cel(fmt(periodoInicio)),
              hdr('HASTA:'),
              cel(fmt(periodoFin)),
            ],
            // Fila CDP / RP — siempre presente (legacy línea 951)
            [
              hdr('DISPONIBILIDAD PRESUPUESTAL'),
              cel('(CDP — API preliquidación)'),
              { colSpan: 2, ...hdr('CERTIFICADO REGISTRO PRESUPUESTAL:') },
              {},
              { colSpan: 3, ...cel('(RP — API preliquidación)') },
              {},
              {},
            ],
          ],
        },
      },

      // ── 4. Objeto del contrato ─────────────────────────────────────────────
      {
        style: 'tableContractInfo',
        table: {
          widths: ['auto', '*'],
          heights: 40,
          body: [[
            hdr('OBJETO DEL CONTRATO:'),
            { text: informe.objeto, alignment: 'justify', fontSize: 10 },
          ]],
        },
      },

      // ── 5. Tabla de actividades ────────────────────────────────────────────
      // El legacy usaba [28, 135, 70, 210, 145, '*'] con evidencias crudas (rutas/URLs largas).
      // Anchos por contenido real (FOLIO horizontal, 916pt útiles):
      //   No.=28 | Act.específicas=*(~373) | %avance=70 | Act.realizadas=195 | Producto=130 | Evidencias=120
      // %avance=70 (igual al legacy): "PORCENTAJE" cabe en 1 línea, "DE AVANCE" en la 2ª.
      // Evidencias=120 (~26 chars/línea): texto plano largo cabe en ~4 líneas.
      {
        style: 'tableContractInfo',
        table: {
          dontBreakRows: true,
          widths: [28, '*', 70, 195, 130, 120],
          body: construirTablaActividades(actividades),
        },
      },

      // ── 6. Novedades postcontractuales ─────────────────────────────────────
      // Issue 3: el legacy siempre incluye este bloque (tablaNovedades()).
      // En el sandbox no hay novedades — se muestra solo el encabezado, igual que
      // cuando novedadesInforme.length === 0 en el legacy.
      {
        style: 'tableContractInfo',
        table: {
          dontBreakRows: true,
          widths: ['*'],
          body: [[{ text: 'NOVEDADES POSTCONTRACTUALES', style: 'actividadesHeader' }]],
        },
      },

      // ── 7. Sección de certificación ────────────────────────────────────────
      {
        style: 'tableContractInfo',
        table: {
          dontBreakRows: true,
          widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              {
                colSpan: 8,
                text: 'EL JEFE DE (DEPENDENCIA) DE LA UNIVERSIDAD DISTRITAL FRANCISCO JOSÉ DE CALDAS\nCERTIFICA QUE EL/LA CONTRATISTA:',
                alignment: 'center', bold: true, fontSize: 11, margin: [0, 5, 0, 0],
              },
              {}, {}, {}, {}, {}, {}, {},
            ],
            [
              { text: 'NOMBRE DEL CONTRATISTA:', bold: true, fontSize: 11, margin: [0, 5, 0, 0] },
              { text: '(dato de sesión)',          fontSize: 11, margin: [0, 5, 0, 0] },
              { text: 'TIPO DE IDENTIFICACIÓN:', bold: true, fontSize: 11, margin: [0, 5, 0, 0] },
              { text: '—', alignment: 'center',   fontSize: 11, margin: [0, 5, 0, 0] },
              { text: 'No.', bold: true,           fontSize: 11, margin: [0, 5, 0, 0] },
              { text: '—', alignment: 'center',   fontSize: 11, margin: [0, 5, 0, 0] },
              { text: 'De', bold: true,            fontSize: 11, margin: [0, 5, 0, 0] },
              { text: '—', alignment: 'center',   fontSize: 11, margin: [0, 5, 0, 0] },
            ],
            [
              {
                colSpan: 8,
                text: `Viene cumpliendo a satisfacción con el objeto establecido en el contrato de prestación de servicios No. ${informe.numeroContrato} ${fmtLargo(informe.fechaInicio)}.`,
                alignment: 'justify', fontSize: 11, margin: [0, 5, 0, 0],
              },
              {}, {}, {}, {}, {}, {}, {},
            ],
            [
              { text: 'VALOR DEL CONTRATO',                               bold: true, fontSize: 11, margin: [0, 5, 0, 0] },
              { colSpan: 2, text: 'EJECUTADO EN TIEMPO (%)',               bold: true, fontSize: 11, margin: [0, 5, 0, 0] },
              {},
              { text: '—', alignment: 'center', bold: true, fontSize: 11, margin: [0, 5, 0, 0] },
              { colSpan: 3, text: 'PENDIENTE POR EJECUTAR EN TIEMPO (%)',  bold: true, fontSize: 11, margin: [0, 5, 0, 0] },
              {}, {},
              { text: '—', alignment: 'center', fontSize: 11, margin: [0, 5, 0, 0] },
            ],
            [
              { text: '—', alignment: 'center', bold: true, fontSize: 11, margin: [0, 5, 0, 0] },
              { colSpan: 2, text: 'EJECUTADO EN DINERO ($)',               bold: true, fontSize: 11, margin: [0, 5, 0, 0] },
              {},
              { text: '—', alignment: 'center', bold: true, fontSize: 11, margin: [0, 5, 0, 0] },
              { colSpan: 3, text: 'PENDIENTE POR EJECUTAR EN DINERO ($)',  bold: true, fontSize: 11, margin: [0, 5, 0, 0] },
              {}, {},
              { text: '—', alignment: 'center', fontSize: 11, margin: [0, 5, 0, 0] },
            ],
            [
              {
                colSpan: 8,
                text: 'Nota: El/La contratista autoriza a la Universidad Distrital para hacer el abono de sus pagos a la cuenta bancaria relacionada. Bajo gravedad del juramento, certifica que está realizando los aportes a seguridad social, de conformidad con lo establecido por la Ley.',
                alignment: 'justify', bold: true, fontSize: 11, margin: [0, 5, 0, 0],
              },
              {}, {}, {}, {}, {}, {}, {},
            ],
          ],
        },
      },

      // ── 8. Firmas ──────────────────────────────────────────────────────────
      {
        margin: [0, 20, 0, 0],
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            table: {
              body: [
                [{ border: [false, false, false, true],  text: '(Contratista)', alignment: 'center' }],
                [{ border: [false, true,  false, false], text: 'CONTRATISTA',  bold: true, alignment: 'center' }],
              ],
            },
          },
          { width: '*', text: '' },
          {
            width: 'auto',
            table: {
              body: [
                [{ border: [false, false, false, true],  text: supervisor,   alignment: 'center' }],
                [{ border: [false, true,  false, false], text: 'SUPERVISOR', bold: true, alignment: 'center' }],
              ],
            },
          },
          { width: '*', text: '' },
        ],
      },

    ],

    // ── Estilos — idénticos al legacy ─────────────────────────────────────────
    styles: {
      tableHeader: {
        margin:    [0, 0, 0, 0],
        alignment: 'center',
        color:     'black',
        fontSize:  10,
      },
      tableContractInfo: {
        margin:   [0, 15, 0, 0],
        color:    'black',
        fontSize: 10,
      },
      actividadesHeader: {
        bold:      true,
        fontSize:  11,
        fillColor: '#CCCCCC',
        alignment: 'center',
        margin:    [0, 3, 0, 0],
      },
      actividadesText: {
        fontSize:  8,
        alignment: 'left',
        margin:    [0, 3, 0, 3],
      },
    },

    // Issue 6: logos institucionales base64 — idénticos al legacy.
    images: {
      logo_ud:    LOGO_UD,
      logo_sigud: LOGO_SIGUD,
    },
  };

  return pdfMake.createPdf(docDefinition);
}
