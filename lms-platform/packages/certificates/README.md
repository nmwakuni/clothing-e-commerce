# @lms/certificates

Professional PDF certificate generation system for course completion.

## Features

- 📜 Beautiful A4 landscape PDF certificates
- 🎨 Customizable templates and colors
- 🔐 QR code verification support
- ✍️ Digital signatures
- 📊 Grade and completion details
- 🌍 Professional design for African context

## Installation

```bash
pnpm install
```

## Usage

### Generate a certificate

```typescript
import { CertificateService } from '@lms/certificates';

const certService = new CertificateService();

const pdfBuffer = await certService.generateCertificate({
  studentName: 'John Kamau',
  courseName: 'Web Development Fundamentals',
  completionDate: new Date(),
  certificateId: 'CERT-2024-001',
  instructorName: 'Sarah Njeri',
  grade: 'A',
  hoursCompleted: 40,
  verificationUrl: 'https://skillhub.co.ke/verify/CERT-2024-001',
});

// Save to file
fs.writeFileSync('certificate.pdf', pdfBuffer);
```

### Customize template

```typescript
const pdfBuffer = await certService.generateCertificate(
  {
    studentName: 'Mary Wanjiku',
    courseName: 'Python for Data Science',
    completionDate: new Date(),
    certificateId: 'CERT-2024-002',
  },
  {
    primaryColor: '#3b82f6',
    secondaryColor: '#2563eb',
    accentColor: '#f59e0b',
    includeQR: true,
    includeGrade: false,
  }
);
```

### Stream response (for HTTP)

```typescript
const stream = await certService.generateCertificateStream({
  studentName: 'Peter Omondi',
  courseName: 'Mobile App Development',
  completionDate: new Date(),
  certificateId: 'CERT-2024-003',
});

// In Express/Hono
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', 'attachment; filename=certificate.pdf');
stream.pipe(res);
```

## Certificate Data

```typescript
interface CertificateData {
  studentName: string; // Required
  courseName: string; // Required
  completionDate: Date; // Required
  certificateId: string; // Required
  instructorName?: string; // Optional
  grade?: string; // Optional (A, B, C, Pass, etc.)
  hoursCompleted?: number; // Optional
  verificationUrl?: string; // Optional (for QR code)
}
```

## Template Options

```typescript
interface CertificateTemplate {
  primaryColor?: string; // Default: #22c55e (green)
  secondaryColor?: string; // Default: #16a34a (dark green)
  accentColor?: string; // Default: #fbbf24 (yellow)
  logoUrl?: string; // Custom logo (future)
  signatureUrl?: string; // Custom signature (future)
  includeQR?: boolean; // Default: true
  includeGrade?: boolean; // Default: true
}
```

## Integration Examples

### With API Route

```typescript
import { CertificateService } from '@lms/certificates';
import { Hono } from 'hono';

const app = new Hono();
const certService = new CertificateService();

app.get('/api/certificates/:id', async (c) => {
  const certId = c.req.param('id');

  // Fetch certificate data from database
  const cert = await db.getCertificate(certId);

  if (!cert) {
    return c.notFound();
  }

  const pdfBuffer = await certService.generateCertificate({
    studentName: cert.studentName,
    courseName: cert.courseName,
    completionDate: new Date(cert.completionDate),
    certificateId: cert.id,
    verificationUrl: `https://skillhub.co.ke/verify/${cert.id}`,
  });

  return c.body(pdfBuffer, 200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=certificate-${certId}.pdf`,
  });
});
```

### With Email Notifications

```typescript
import { CertificateService } from '@lms/certificates';
import { ResendNotificationService } from '@lms/notifications';

const certService = new CertificateService();
const emailService = new ResendNotificationService(apiKey);

// Generate certificate
const pdfBuffer = await certService.generateCertificate(data);

// Send via email
await emailService.sendEmail({
  to: student.email,
  subject: 'Your Course Certificate',
  html: `Congratulations! Your certificate is attached.`,
  attachments: [
    {
      filename: 'certificate.pdf',
      content: pdfBuffer,
    },
  ],
});
```

### With WhatsApp

```typescript
import { CertificateService } from '@lms/certificates';
import { WhatsAppService } from '@lms/whatsapp';

// Generate and upload certificate
const pdfBuffer = await certService.generateCertificate(data);

// Upload to cloud storage (S3, Cloudflare R2, etc.)
const url = await uploadToStorage(pdfBuffer, 'certificates');

// Send link via WhatsApp
await whatsapp.sendTextMessage(
  phoneNumber,
  `🎓 Congratulations! Your certificate is ready:\n\n${url}`
);
```

## Certificate Verification

Store certificate data in database for verification:

```typescript
// When generating certificate
const cert = await db.certificates.create({
  id: certificateId,
  userId: user.id,
  courseId: course.id,
  studentName: user.fullName,
  courseName: course.title,
  completionDate: new Date(),
  grade: finalGrade,
  issuedAt: new Date(),
});

// Verification endpoint
app.get('/verify/:id', async (c) => {
  const certId = c.req.param('id');
  const cert = await db.getCertificate(certId);

  if (cert) {
    return c.json({
      valid: true,
      studentName: cert.studentName,
      courseName: cert.courseName,
      completionDate: cert.completionDate,
    });
  }

  return c.json({ valid: false }, 404);
});
```

## Certificate Features

- **Professional Design**: A4 landscape layout
- **Decorative Elements**: Borders, corner decorations, gold accents
- **QR Code**: Scan to verify authenticity
- **Certificate ID**: Unique identifier
- **Date**: Completion date
- **Grade**: Optional grade display
- **Signatures**: Instructor and platform signatures
- **Branding**: SkillHub Africa branding

## Future Enhancements

- Custom logo upload
- Custom signature images
- Multiple language support
- Blockchain verification
- NFT certificates
- Social sharing preview images
