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
 *
 * LOGOS INSTITUCIONALES:
 *   El legacy embebe logo_ud y logo_sigud como base64 hardcodeado en el controller.
 *   Aquí se usan celdas de texto; en producción se reemplazan por:
 *   { rowSpan:3, image:'logo_ud', width:70, height:60 }
 *   donde 'logo_ud' es una clave del objeto `images` del docDefinition.
 */

import { createPdf, addFonts } from 'pdfmake';

import type { InformeData, ActividadItem } from './informe-contratista.component';
import type { DetalleContrato } from '../detalle-soporte/detalle-soporte-contratista.component';

// ── Fuentes: Helvetica es fuente estándar PDF (Type1); no requiere VFS. ───────
addFonts({
  Helvetica: {
    normal:      'Helvetica',
    bold:        'Helvetica-Bold',
    italics:     'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(fechaIso: string): string {
  if (!fechaIso) return '—';
  const parts = fechaIso.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
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
 */
function construirTablaActividades(actividades: ActividadItem[]): object[][] {
  const body: object[][] = [];

  // Encabezado — idéntico al legacy
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
    const count = Math.max(realizadas.length, 1); // al menos 1 fila por actividad

    for (let j = 0; j < count; j++) {
      const ar = realizadas[j];

      // Lista de evidencias — bullet list con '•', igual al legacy
      const evidenciasStack = ar
        ? ar.evidencias.map((ev) => ({
            columns: [
              { width: 8, text: '\u2022', margin: [0, 1, 0, 0] },
              {
                width: '*',
                text: ev.tipo === 'enlace' ? `[Enlace] ${ev.valor}` : ev.valor,
                italics: true,
                margin: [0, 0, 0, 2],
                style: 'actividadesText',
              },
            ],
            columnGap: 2,
          }))
        : [];

      body.push([
        {},  // No.             → rowSpan, relleno abajo
        {},  // Actividad esp.  → rowSpan, relleno abajo
        {},  // Avance          → rowSpan, relleno abajo
        ar ? { text: ar.actividad,        style: 'actividadesText' } : { text: '' },
        ar ? { text: ar.productoAsociado, style: 'actividadesText' } : { text: '' },
        ar ? { stack: evidenciasStack }                              : { text: '' },
      ]);
    }

    // Primera fila del grupo: rellena con rowSpan (comportamiento legacy)
    body[rowIdx][0] = { rowSpan: count, text: String(i + 1), bold: true, alignment: 'center', style: 'actividadesText' };
    body[rowIdx][1] = { rowSpan: count, text: act.actividadEspecifica || '—',                 style: 'actividadesText' };
    body[rowIdx][2] = { rowSpan: count, text: `${act.avance}%`, alignment: 'center',          style: 'actividadesText' };

    rowIdx += count;
  }

  return body;
}

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Genera y descarga el PDF del certificado de cumplido.
 *
 * No modifica InformeData ni DetalleContrato: los usa tal como están.
 * El supervisor se obtiene del DetalleContrato del mismo pagoMensualId.
 */
export function generarCertificadoPDF(
  informe: InformeData,
  detalle: DetalleContrato | null,
  proceso: string,
  periodoInicio: string,
  periodoFin: string,
  actividades: ActividadItem[],
): void {
  const supervisor = detalle?.supervisor ?? '—';

  // Se tipea como 'any' para evitar la complejidad del tipo TDocumentDefinitions
  // (que @types/pdfmake no re-exporta). La estructura sí es correcta según la spec.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docDefinition: any = {
    // Formato FOLIO (215.9 × 330.2 mm), landscape — igual al legacy
    pageSize:        'FOLIO',
    pageOrientation: 'landscape',
    pageMargins:     [10, 10, 10, 10],

    defaultStyle: { font: 'Helvetica', fontSize: 10 },

    content: [

      // ── 1. Encabezado institucional ────────────────────────────────────────
      // Legacy: { rowSpan:3, image:'logo_ud', width:70, height:60 }
      // Sandbox: celda de texto. En producción reemplazar con image+base64.
      {
        style: 'tableHeader',
        table: {
          widths: [80, '*', 'auto', 80],
          heights: 19,
          headerRows: 1,
          body: [
            [
              { rowSpan: 3, text: '[Logo U.D.]', bold: true, alignment: 'center', margin: [0, 16, 0, 0], fontSize: 9, color: '#999999' },
              { text: 'CERTIFICADO DE CUMPLIMIENTO E INFORME DE GESTIÓN', bold: true, margin: [0, 2, 0, 0] },
              { text: 'Código: PEI-PR-003-FR-009',                         margin: [0, 3, 0, 0] },
              { rowSpan: 3, text: '[SIGUD]',   bold: true, alignment: 'center', margin: [0, 16, 0, 0], fontSize: 9, color: '#999999' },
            ],
            ['', { text: 'Macroproceso: Direccionamiento Estratégico',                     margin: [0, 3, 0, 0] }, { text: 'Versión: 02',                      margin: [0, 3, 0, 0] }, ''],
            ['', { text: 'Proceso: Planeación Estratégica e Institucional', margin: [22, 3, 0, 0] }, { text: 'Fecha de Aprobación: 14/03/2022', margin: [35, 3, 0, 0] }, ''],
          ],
        },
      },

      // ── 2. Número de contrato ──────────────────────────────────────────────
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
                cel(fmt(informe.fechaInicio)),
              ]],
            },
          },
          { width: 152, text: '' },
        ],
      },

      // ── 3. Información contractual ─────────────────────────────────────────
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
      {
        style: 'tableContractInfo',
        table: {
          dontBreakRows: true,
          widths: [28, 135, 70, 210, 145, '*'],
          body: construirTablaActividades(actividades),
        },
      },

      // ── 6. Sección de certificación ────────────────────────────────────────
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
                text: `Viene cumpliendo a satisfacción con el objeto establecido en el contrato de prestación de servicios No. ${informe.numeroContrato} (${fmt(informe.fechaInicio)}).`,
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

      // ── 7. Firmas ──────────────────────────────────────────────────────────
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
  };

  const filename = `certificado-cumplido-${informe.numeroContrato.replace('/', '-')}-${informe.mes}-${informe.ano}.pdf`;
  createPdf(docDefinition).download(filename);
}
