"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">{t("welcome")}</h1>
      <Link href="/upload" className="text-blue-500 hover:underline text-xl">
        {t("go_to_upload")}
      </Link>
    </main>
  );
}
