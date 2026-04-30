import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'ContentNest – Headless CMS & Blog',
    template: '%s | ContentNest',
  },
  description: 'A modern headless CMS and blog platform built for performance and flexibility.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'ContentNest',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
