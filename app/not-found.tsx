"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <main className="not-found-shell">
      <div className="not-found-card">
        <p className="selector-kicker">MetaCorpus Explorer</p>
        <h1>{t.notFound.title}</h1>
        <p>{t.notFound.description}</p>
        <Link href="/" className="change-corpus-link">
          {t.notFound.backToSelector}
        </Link>
      </div>
    </main>
  );
}
