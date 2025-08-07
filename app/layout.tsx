import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/local-mermaid' : '';

export const metadata: Metadata = {
  title: 'Mermaid Editor - Interactive Diagram Creator',
  description:
    'Create, edit, and export beautiful Mermaid diagrams with real-time preview',
  keywords: ['mermaid', 'diagrams', 'flowchart', 'editor', 'visualization'],
  icons: {
    icon: `${basePath}/favicon.ico`,
    shortcut: `${basePath}/favicon.ico`,
    apple: `${basePath}/favicon.ico`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}
