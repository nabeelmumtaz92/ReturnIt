import PDFDocument from 'pdfkit';
import { TaxYear1099Data } from './tax1099Service';
import fs from 'fs';
import path from 'path';

export interface CompanyInfo {
  name: string;
  ein: string; // Employer Identification Number
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
}

export class PDF1099Service {
  private static readonly COMPANY_INFO: CompanyInfo = {
    name: 'Return It LLC',
    ein: process.env.COMPANY_EIN || '00-0000000',
    address: process.env.COMPANY_ADDRESS || '123 Main Street',
    city: process.env.COMPANY_CITY || 'St. Louis',
    state: process.env.COMPANY_STATE || 'MO',
    zip: process.env.COMPANY_ZIP || '63101',
    phone: process.env.COMPANY_PHONE || '(314) 555-0000',
  };

  /**
   * Generate a 1099-NEC form PDF for a driver
   */
  static async generate1099PDF(
    data: TaxYear1099Data,
    outputPath?: string
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
        const chunks: Buffer[] = [];

        // Collect PDF chunks
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          
          // Optionally save to file
          if (outputPath) {
            fs.writeFileSync(outputPath, pdfBuffer);
          }
          
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Generate the PDF content
        this.renderForm1099NEC(doc, data);

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Render the 1099-NEC form content
   */
  private static renderForm1099NEC(doc: PDFKit.PDFDocument, data: TaxYear1099Data) {
    const pageWidth = 612; // Letter size width in points
    const pageHeight = 792; // Letter size height in points

    // Title
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Form 1099-NEC', 50, 50, { align: 'center' });

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`(Rev. January ${data.taxYear})`, 50, 70, { align: 'center' });

    doc
      .fontSize(10)
      .text('Nonemployee Compensation', 50, 85, { align: 'center' });

    // Tax year
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`Tax Year: ${data.taxYear}`, 50, 110);

    // Draw form boxes
    let y = 150;
    const leftCol = 50;
    const rightCol = 320;
    const boxHeight = 60;

    // PAYER'S Information (left side)
    this.drawBox(doc, leftCol, y, 250, boxHeight);
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text("PAYER'S name, street address, city or town, state or province,", leftCol + 5, y + 5);
    doc.text("country, ZIP or foreign postal code, and telephone no.", leftCol + 5, y + 15);
    
    doc
      .fontSize(9)
      .font('Helvetica')
      .text(this.COMPANY_INFO.name, leftCol + 5, y + 30)
      .text(this.COMPANY_INFO.address, leftCol + 5, y + 42)
      .text(`${this.COMPANY_INFO.city}, ${this.COMPANY_INFO.state} ${this.COMPANY_INFO.zip}`, leftCol + 5, y + 54);

    // PAYER'S TIN (right of payer info)
    this.drawBox(doc, rightCol, y, 100, boxHeight / 2);
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text("PAYER'S TIN", rightCol + 5, y + 5);
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(this.COMPANY_INFO.ein, rightCol + 5, y + 18);

    // RECIPIENT'S TIN (below payer's TIN)
    this.drawBox(doc, rightCol, y + boxHeight / 2, 100, boxHeight / 2);
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text("RECIPIENT'S TIN", rightCol + 5, y + boxHeight / 2 + 5);
    doc
      .fontSize(10)
      .font('Helvetica')
      .text('XXX-XX-XXXX', rightCol + 5, y + boxHeight / 2 + 18);

    // RECIPIENT'S Information
    y += boxHeight + 10;
    this.drawBox(doc, leftCol, y, 250, boxHeight);
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text("RECIPIENT'S name", leftCol + 5, y + 5);
    
    const recipientName = `${data.driverInfo.firstName || ''} ${data.driverInfo.lastName || ''}`.trim();
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(recipientName, leftCol + 5, y + 20);

    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text("Street address (including apt. no.)", leftCol + 5, y + 35);
    
    const address = data.driverInfo.address;
    if (address) {
      doc
        .fontSize(9)
        .font('Helvetica')
        .text(address.street || 'N/A', leftCol + 5, y + 47);
    }

    // City, State, ZIP
    y += boxHeight + 5;
    this.drawBox(doc, leftCol, y, 250, 30);
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text("City or town, state or province, country, and ZIP or foreign postal code", leftCol + 5, y + 5);
    
    if (address) {
      doc
        .fontSize(9)
        .font('Helvetica')
        .text(`${address.city || ''}, ${address.state || ''} ${address.zipCode || ''}`, leftCol + 5, y + 18);
    }

    // Account number (optional)
    this.drawBox(doc, rightCol, y, 100, 30);
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text("Account number (see instructions)", rightCol + 5, y + 5);
    doc
      .fontSize(9)
      .font('Helvetica')
      .text(`DRV-${data.driverId}`, rightCol + 5, y + 18);

    // MAIN AMOUNT BOXES
    y += 40;
    const amountBoxWidth = 150;
    const amountBoxHeight = 50;

    // Box 1: Nonemployee compensation
    this.drawBox(doc, leftCol, y, amountBoxWidth, amountBoxHeight);
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('1  Nonemployee compensation', leftCol + 5, y + 5);
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(`$${data.totalEarnings.toFixed(2)}`, leftCol + 10, y + 22);

    // Box 2: Payer made direct sales totaling $5,000 or more
    this.drawBox(doc, leftCol + amountBoxWidth + 10, y, amountBoxWidth, amountBoxHeight);
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('2  Payer made direct sales totaling', leftCol + amountBoxWidth + 15, y + 5);
    doc.text('   $5,000 or more of consumer products', leftCol + amountBoxWidth + 15, y + 15);
    doc.fontSize(9).font('Helvetica').text('☐', leftCol + amountBoxWidth + 15, y + 30);

    // Box 4: Federal income tax withheld
    y += amountBoxHeight + 10;
    this.drawBox(doc, leftCol, y, amountBoxWidth, amountBoxHeight);
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('4  Federal income tax withheld', leftCol + 5, y + 5);
    doc
      .fontSize(12)
      .font('Helvetica')
      .text('$0.00', leftCol + 10, y + 22);

    // Box 5: State tax withheld
    this.drawBox(doc, leftCol + amountBoxWidth + 10, y, amountBoxWidth, amountBoxHeight);
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('5  State tax withheld', leftCol + amountBoxWidth + 15, y + 5);
    doc
      .fontSize(12)
      .font('Helvetica')
      .text('$0.00', leftCol + amountBoxWidth + 15, y + 22);

    // State information
    y += amountBoxHeight + 10;
    this.drawBox(doc, leftCol, y, amountBoxWidth, 30);
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text("6  State/Payer's state no.", leftCol + 5, y + 5);
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(this.COMPANY_INFO.state, leftCol + 5, y + 18);

    this.drawBox(doc, leftCol + amountBoxWidth + 10, y, amountBoxWidth, 30);
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('7  State income', leftCol + amountBoxWidth + 15, y + 5);
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`$${data.totalEarnings.toFixed(2)}`, leftCol + amountBoxWidth + 15, y + 18);

    // Footer information
    y += 50;
    doc
      .fontSize(8)
      .font('Helvetica')
      .text('This is important tax information and is being furnished to the IRS.', leftCol, y);
    doc.text('If you are required to file a return, a negligence penalty or other sanction may be imposed', leftCol, y + 12);
    doc.text('on you if this income is taxable and the IRS determines that it has not been reported.', leftCol, y + 24);

    // Generation metadata
    y += 50;
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor('#666666')
      .text(`Generated: ${new Date().toLocaleDateString()}`, leftCol, y)
      .text(`Document ID: 1099-NEC-${data.taxYear}-${data.driverId}`, leftCol, y + 10)
      .text(`Payout Count: ${data.payoutCount} | First: ${data.firstPayoutDate?.toLocaleDateString() || 'N/A'} | Last: ${data.lastPayoutDate?.toLocaleDateString() || 'N/A'}`, leftCol, y + 20);

    // Reset fill color
    doc.fillColor('#000000');

    // IRS Copy Notice - Copy B
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Copy B - For Recipient', 50, pageHeight - 60);

    doc
      .fontSize(8)
      .font('Helvetica')
      .text('This is important tax information and is being furnished to the IRS.', 50, pageHeight - 45);
    
    doc
      .fontSize(8)
      .font('Helvetica')
      .text('If required to file a return, a negligence penalty or other sanction may be imposed', 50, pageHeight - 33);
    
    doc
      .fontSize(8)
      .font('Helvetica')
      .text('if this income is taxable and not reported.', 50, pageHeight - 21);
  }

  /**
   * Helper to draw a box
   */
  private static drawBox(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    doc
      .rect(x, y, width, height)
      .strokeColor('#000000')
      .lineWidth(0.5)
      .stroke();
  }

  /**
   * Generate filename for 1099 PDF
   */
  static generateFilename(driverId: number, taxYear: number): string {
    return `1099-NEC-${taxYear}-Driver-${driverId}.pdf`;
  }

  /**
   * Get output directory for 1099 PDFs
   */
  static getOutputDirectory(): string {
    const dir = path.join(process.cwd(), 'tax_forms', '1099');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }
}
