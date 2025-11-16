import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nafsi - Mental Health Support for Africa',
  description: 'AI-powered mental health support via WhatsApp and web. Confidential, accessible, 24/7.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
