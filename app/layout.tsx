import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PackLens AI - Ambalaj Analiz Platformu',
  description: 'Yapay zeka destekli ambalaj kıyaslama ve analiz sistemi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
