// app/layout.tsx
'use client';

import '../styles/globals.css';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { dir } from 'i18next';
import { i18n } from '../next-i18next.config';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir={dir(i18n.defaultLocale)}>
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
