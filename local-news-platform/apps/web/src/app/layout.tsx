import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mtaa News - Your Neighborhood, Your News',
  description: 'Hyperlocal AI-powered news platform for African communities',
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
