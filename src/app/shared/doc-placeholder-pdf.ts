import pdfMake from 'pdfmake';
// @ts-ignore
import RobotoFontContainer from 'pdfmake/build/fonts/Roboto';
import { LOGO_UD_ESCUDO } from '../gestion-supervisor/bandeja/logo-escudo-ud';

/**
 * Genera un PDF genérico de ilustración para los botones "Ver documento"
 * del prototipo. Muestra el escudo de la UD y el nombre del documento para
 * que la interacción se sienta contextual sin necesidad de archivos reales.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function crearDocumentoPlaceholderPDF(nombreDocumento: string): any {
  pdfMake.addFontContainer(RobotoFontContainer);
  return pdfMake.createPdf({
    pageMargins: [60, 100, 60, 60],
    content: [
      { image: 'logo', width: 130, alignment: 'center', margin: [0, 0, 0, 48] },
      {
        text: nombreDocumento,
        fontSize: 14,
        bold: true,
        alignment: 'center',
        color: '#111827',
        margin: [0, 0, 0, 16],
      },
      {
        text: '[Vista previa — prototipo]',
        fontSize: 10,
        alignment: 'center',
        color: '#9CA3AF',
        italics: true,
      },
    ],
    images: { logo: LOGO_UD_ESCUDO },
    defaultStyle: { font: 'Roboto' },
  });
}
