import pdfMake from 'pdfmake';
// @ts-ignore
import RobotoFontContainer from 'pdfmake/build/fonts/Roboto';

export interface CertificacionRow {
  documento: string;
  nombre: string;
  contrato: string;
  cdp: number;
  vigencia: number;
  rubro: string;
}

export interface CertificacionParams {
  rubro: string;
  dependencia: string;
  mesNombre: string;
  ano: number;
  mesNombreSS: string;
  anoSS: number;
  nombreSupervisor: string;
  rows: CertificacionRow[];
  logoImage: string;
}

const MESES_SS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function calcMesSeguridadSocial(mes: number, ano: number): { mesNombre: string; ano: number } {
  if (mes === 1) {
    return { mesNombre: 'Diciembre', ano: ano - 1 };
  }
  return { mesNombre: MESES_SS[mes - 2], ano };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function crearCertificacionPDF(params: CertificacionParams): any {
  pdfMake.addFontContainer(RobotoFontContainer);

  const { rubro, dependencia, mesNombre, ano, mesNombreSS, anoSS, nombreSupervisor, rows, logoImage } =
    params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any[] = [
    {
      text:
        'EL JEFE DE LA DEPENDENCIA ' +
        dependencia +
        ' DE LA UNIVERSIDAD DISTRITAL FRANCISCO JOSÉ DE CALDAS',
      bold: true,
      alignment: 'center',
      style: 'top_space',
    },
    '\n\n\n\n',
    { text: 'CERTIFICA QUE:', bold: true, alignment: 'center', style: 'top_space' },
    '\n\n\n\n',
    {
      text:
        'Los contratos de prestación de servicios bajo esta supervisión listados a continuación ' +
        'cumplieron a satisfacción con el objeto establecido en el contrato en el Mes de ' +
        mesNombre +
        ' de ' +
        ano +
        ' y con el pago reglamentario de los aportes al sistema de seguridad social del Mes de ' +
        mesNombreSS +
        ' de ' +
        anoSS +
        '.',
      style: 'general_font',
    },
    '\n\n',
    {
      style: 'tableExample',
      table: {
        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
        body: [
          ['Documento', 'Nombre', 'Contrato', 'Cdp', 'Vigencia', 'Rubro'],
          ...rows.map((r) => [
            r.documento,
            r.nombre,
            r.contrato,
            String(r.cdp),
            String(r.vigencia),
            r.rubro,
          ]),
        ],
      },
    },
    '\n',
    {
      text:
        'Se expide para el trámite de pago ante la DIVISIÓN DE RECURSOS FINANCIEROS al mes de ' +
        mesNombre +
        ' de ' +
        ano +
        '.',
      style: 'general_font',
    },
    '\n\n\n\n\n\n',
    { text: nombreSupervisor.toUpperCase(), style: 'bottom_space' },
    { text: 'JEFE DE', style: 'bottom_space' },
    { text: dependencia, style: 'bottom_space' },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docDefinition: any = {
    footer: (currentPage: number, pageCount: number) => [
      {
        text: rubro + ' ' + currentPage + ' de ' + pageCount,
        width: 'auto',
        alignment: 'right',
        fontSize: 10,
        margin: [5, 5, 15, 10],
      },
    ],
    pageMargins: [30, 140, 40, 40],
    header: {
      height: 120,
      width: 120,
      image: 'logo_ud',
      margin: [100, 15, 5, 5],
      alignment: 'center',
    },
    images: { logo_ud: logoImage },
    content,
    styles: {
      top_space: { fontSize: 11, marginTop: 30 },
      bottom_space: { fontSize: 12, bold: true, alignment: 'center' },
      general_font: { fontSize: 11, alignment: 'justify' },
      lista: { fontSize: 9, alignment: 'justify' },
    },
    defaultStyle: { font: 'Roboto' },
  };

  return pdfMake.createPdf(docDefinition);
}

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function buildCertFilename(rubro: string): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp =
    pad(now.getDate()) +
    '_' +
    MONTHS_SHORT[now.getMonth()] +
    '_' +
    now.getFullYear() +
    '_' +
    pad(now.getHours()) +
    '_' +
    pad(now.getMinutes()) +
    '_' +
    pad(now.getSeconds());
  return 'Certificación cumplido ' + rubro + ' ' + stamp + '.pdf';
}
