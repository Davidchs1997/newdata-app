// app/layout.tsx
"use client";

import "@/styles/globals.css";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/components/i18n-provider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <I18nProvider>
            {children}
            <Toaster />
          </I18nProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
