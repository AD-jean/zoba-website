import PDFDocument from 'pdfkit';
import { generateQrBuffer } from './ticket.service';

interface TicketPdfParams {
  name: string;
  activityTitle: string;
  activityDate?: string;
  activityLocation: string;
  ticketCode: string;
}

const TEAL = '#0e4a56';
const TEAL_LIGHT = '#e8f4f6';
const GRAY = '#6b7280';

export const generateTicketPdf = async ({
  name,
  activityTitle,
  activityDate,
  activityLocation,
  ticketCode
}: TicketPdfParams): Promise<Buffer> => {
  const qrBuffer = await generateQrBuffer(ticketCode);

  const doc = new PDFDocument({ size: [420, 620], margin: 0 });
  const chunks: Buffer[] = [];
  doc.on('data', chunk => chunks.push(chunk));
  const done = new Promise<Buffer>(resolve => doc.on('end', () => resolve(Buffer.concat(chunks))));

  // En-tete
  doc.rect(0, 0, 420, 130).fill(TEAL);
  doc
    .fillColor('#ffffff')
    .fontSize(11)
    .text('ZONE BAPTISTE AGAPÉ — ZOBA', 32, 36, { characterSpacing: 1 });
  doc
    .fontSize(22)
    .text(activityTitle, 32, 60, { width: 356, lineBreak: true });

  // Corps
  let y = 155;
  doc.fillColor('#111827').fontSize(13).text('Billet nominatif', 32, y);
  y += 26;
  doc.fillColor(GRAY).fontSize(10).text('NOM', 32, y);
  doc.fillColor('#111827').fontSize(14).text(name, 32, y + 14);
  y += 46;

  if (activityDate) {
    doc.fillColor(GRAY).fontSize(10).text('DATE', 32, y);
    doc.fillColor('#111827').fontSize(12).text(activityDate, 32, y + 14);
    y += 40;
  }

  doc.fillColor(GRAY).fontSize(10).text('LIEU', 32, y);
  doc.fillColor('#111827').fontSize(12).text(activityLocation, 32, y + 14, { width: 356 });
  y += 60;

  // QR
  doc.rect(32, y, 356, 300).fill(TEAL_LIGHT);
  doc.image(qrBuffer, 116, y + 30, { width: 188, height: 188 });
  doc
    .fillColor(TEAL)
    .fontSize(9)
    .text('Présentez ce QR code à l\'entrée', 32, y + 235, { width: 356, align: 'center' });
  doc
    .fillColor(GRAY)
    .fontSize(8)
    .text(ticketCode, 32, y + 252, { width: 356, align: 'center' });

  doc.end();
  return done;
};
