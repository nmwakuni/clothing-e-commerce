import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkillHub Africa - Learn Anything, Anytime',
  description: 'AI-powered learning platform for Africa. Learn skills via WhatsApp, Web, or Mobile.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
