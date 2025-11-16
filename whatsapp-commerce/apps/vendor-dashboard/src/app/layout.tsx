import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Biashara Vendor Dashboard',
  description: 'Manage your products and orders on Biashara',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
