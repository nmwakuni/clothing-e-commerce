import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { Readable } from 'stream';

export interface CertificateData {
  studentName: string;
  courseName: string;
  completionDate: Date;
  certificateId: string;
  instructorName?: string;
  grade?: string;
  hoursCompleted?: number;
  verificationUrl?: string;
}

export interface CertificateTemplate {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  signatureUrl?: string;
  includeQR?: boolean;
  includeGrade?: boolean;
}

export class CertificateService {
  private defaultTemplate: CertificateTemplate = {
    primaryColor: '#22c55e',
    secondaryColor: '#16a34a',
    accentColor: '#fbbf24',
    includeQR: true,
    includeGrade: true,
  };

  /**
   * Generate a certificate PDF
   */
  async generateCertificate(
    data: CertificateData,
    template?: Partial<CertificateTemplate>
  ): Promise<Buffer> {
    const finalTemplate = { ...this.defaultTemplate, ...template };

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.buildCertificate(doc, data, finalTemplate)
        .then(() => {
          doc.end();
        })
        .catch(reject);
    });
  }

  /**
   * Generate certificate and return as stream
   */
  async generateCertificateStream(
    data: CertificateData,
    template?: Partial<CertificateTemplate>
  ): Promise<Readable> {
    const finalTemplate = { ...this.defaultTemplate, ...template };
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    this.buildCertificate(doc, data, finalTemplate).then(() => {
      doc.end();
    });

    return doc;
  }

  private async buildCertificate(
    doc: PDFKit.PDFDocument,
    data: CertificateData,
    template: CertificateTemplate
  ): Promise<void> {
    const pageWidth = 841.89; // A4 landscape width in points
    const pageHeight = 595.28; // A4 landscape height in points

    // Border
    doc
      .rect(30, 30, pageWidth - 60, pageHeight - 60)
      .lineWidth(3)
      .strokeColor(template.primaryColor!)
      .stroke();

    doc
      .rect(40, 40, pageWidth - 80, pageHeight - 80)
      .lineWidth(1)
      .strokeColor(template.secondaryColor!)
      .stroke();

    // Decorative corner elements
    this.drawCornerDecorations(doc, template.accentColor!);

    // Certificate of Achievement
    doc
      .fontSize(48)
      .font('Helvetica-Bold')
      .fillColor(template.primaryColor!)
      .text('Certificate of Achievement', 0, 100, {
        align: 'center',
        width: pageWidth,
      });

    // Decorative line
    const lineY = 170;
    doc
      .moveTo(pageWidth / 2 - 150, lineY)
      .lineTo(pageWidth / 2 + 150, lineY)
      .lineWidth(2)
      .strokeColor(template.accentColor!)
      .stroke();

    // "This is to certify that"
    doc
      .fontSize(16)
      .font('Helvetica')
      .fillColor('#374151')
      .text('This is to certify that', 0, 200, {
        align: 'center',
        width: pageWidth,
      });

    // Student name
    doc.fontSize(36).font('Helvetica-Bold').fillColor('#111827').text(data.studentName, 0, 240, {
      align: 'center',
      width: pageWidth,
    });

    // Underline for name
    doc
      .moveTo(pageWidth / 2 - 200, 285)
      .lineTo(pageWidth / 2 + 200, 285)
      .lineWidth(1)
      .strokeColor('#d1d5db')
      .stroke();

    // "has successfully completed"
    doc
      .fontSize(16)
      .font('Helvetica')
      .fillColor('#374151')
      .text('has successfully completed the course', 0, 305, {
        align: 'center',
        width: pageWidth,
      });

    // Course name
    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .fillColor(template.primaryColor!)
      .text(data.courseName, 0, 345, {
        align: 'center',
        width: pageWidth,
      });

    // Additional info
    const infoY = 400;
    const infoSpacing = pageWidth / 4;

    // Date
    doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text('Date of Completion', infoSpacing - 80, infoY, {
        width: 160,
        align: 'center',
      });

    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text(this.formatDate(data.completionDate), infoSpacing - 80, infoY + 20, {
        width: 160,
        align: 'center',
      });

    // Certificate ID
    doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text('Certificate ID', infoSpacing * 2 - 80, infoY, {
        width: 160,
        align: 'center',
      });

    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text(data.certificateId, infoSpacing * 2 - 80, infoY + 20, {
        width: 160,
        align: 'center',
      });

    // Grade (if included)
    if (template.includeGrade && data.grade) {
      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text('Grade', infoSpacing * 3 - 80, infoY, {
          width: 160,
          align: 'center',
        });

      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#111827')
        .text(data.grade, infoSpacing * 3 - 80, infoY + 20, {
          width: 160,
          align: 'center',
        });
    }

    // Footer section
    const footerY = 490;

    // Instructor signature
    if (data.instructorName) {
      doc.moveTo(150, footerY).lineTo(300, footerY).lineWidth(1).strokeColor('#d1d5db').stroke();

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#111827')
        .text(data.instructorName, 150, footerY + 10, {
          width: 150,
          align: 'center',
        });

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text('Instructor', 150, footerY + 28, {
          width: 150,
          align: 'center',
        });
    }

    // Organization signature
    doc
      .moveTo(pageWidth - 300, footerY)
      .lineTo(pageWidth - 150, footerY)
      .lineWidth(1)
      .strokeColor('#d1d5db')
      .stroke();

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text('SkillHub Africa', pageWidth - 300, footerY + 10, {
        width: 150,
        align: 'center',
      });

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text('Platform', pageWidth - 300, footerY + 28, {
        width: 150,
        align: 'center',
      });

    // QR Code for verification
    if (template.includeQR && data.verificationUrl) {
      try {
        const qrCodeBuffer = await QRCode.toBuffer(data.verificationUrl, {
          width: 80,
          margin: 1,
        });

        doc.image(qrCodeBuffer, pageWidth / 2 - 40, footerY - 10, {
          width: 80,
          height: 80,
        });

        doc
          .fontSize(8)
          .fillColor('#6b7280')
          .text('Scan to verify', pageWidth / 2 - 50, footerY + 75, {
            width: 100,
            align: 'center',
          });
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    }

    // SkillHub Africa branding
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(template.primaryColor!)
      .text('🎓 SkillHub Africa', 50, 50, {
        width: 200,
      });

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text("Building Africa's Future", 50, 65, {
        width: 200,
      });
  }

  private drawCornerDecorations(doc: PDFKit.PDFDocument, color: string): void {
    const cornerSize = 30;
    const offset = 45;

    // Top-left
    doc
      .moveTo(offset, offset + cornerSize)
      .lineTo(offset, offset)
      .lineTo(offset + cornerSize, offset)
      .lineWidth(3)
      .strokeColor(color)
      .stroke();

    // Top-right
    doc
      .moveTo(841.89 - offset - cornerSize, offset)
      .lineTo(841.89 - offset, offset)
      .lineTo(841.89 - offset, offset + cornerSize)
      .lineWidth(3)
      .strokeColor(color)
      .stroke();

    // Bottom-left
    doc
      .moveTo(offset, 595.28 - offset - cornerSize)
      .lineTo(offset, 595.28 - offset)
      .lineTo(offset + cornerSize, 595.28 - offset)
      .lineWidth(3)
      .strokeColor(color)
      .stroke();

    // Bottom-right
    doc
      .moveTo(841.89 - offset - cornerSize, 595.28 - offset)
      .lineTo(841.89 - offset, 595.28 - offset)
      .lineTo(841.89 - offset, 595.28 - offset - cornerSize)
      .lineWidth(3)
      .strokeColor(color)
      .stroke();
  }

  private formatDate(date: Date): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  }
}
