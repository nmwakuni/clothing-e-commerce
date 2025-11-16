import { describe, it, expect } from 'vitest';
import { CertificateService } from './index';

describe('CertificateService', () => {
  let service: CertificateService;

  beforeEach(() => {
    service = new CertificateService();
  });

  describe('generateCertificate', () => {
    it('should generate PDF buffer', async () => {
      const data = {
        studentName: 'John Kamau',
        courseName: 'Web Development Fundamentals',
        completionDate: new Date('2024-01-15'),
        certificateId: 'CERT-2024-001',
        instructorName: 'Sarah Njeri',
        grade: 'A',
      };

      const pdfBuffer = await service.generateCertificate(data);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);

      // Check PDF header
      const header = pdfBuffer.toString('ascii', 0, 5);
      expect(header).toBe('%PDF-');
    });

    it('should handle custom template colors', async () => {
      const data = {
        studentName: 'Mary Wanjiku',
        courseName: 'Python for Data Science',
        completionDate: new Date(),
        certificateId: 'CERT-2024-002',
      };

      const template = {
        primaryColor: '#3b82f6',
        secondaryColor: '#2563eb',
        accentColor: '#f59e0b',
      };

      const pdfBuffer = await service.generateCertificate(data, template);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it('should generate certificate without optional fields', async () => {
      const data = {
        studentName: 'Peter Omondi',
        courseName: 'Mobile App Development',
        completionDate: new Date(),
        certificateId: 'CERT-2024-003',
      };

      const pdfBuffer = await service.generateCertificate(data, {
        includeQR: false,
        includeGrade: false,
      });

      expect(pdfBuffer).toBeInstanceOf(Buffer);
    });
  });

  describe('generateCertificateStream', () => {
    it('should generate readable stream', async () => {
      const data = {
        studentName: 'Test Student',
        courseName: 'Test Course',
        completionDate: new Date(),
        certificateId: 'TEST-001',
      };

      const stream = await service.generateCertificateStream(data);

      expect(stream).toBeDefined();
      expect(stream.readable).toBe(true);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = (service as any).formatDate(date);

      expect(formatted).toContain('January');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('15');
    });
  });
});
