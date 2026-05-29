"use client";

import Link from "next/link";

import type { CorpusSummary } from "@/lib/corpora";
import { useLanguage } from "@/lib/i18n/language-context";
import { LanguageSelector } from "./language-selector";

type ActiveCorpusBarProps = {
  corpus: CorpusSummary;
};

export function ActiveCorpusBar({ corpus }: ActiveCorpusBarProps) {
  const { t } = useLanguage();

  return (
    <div className="active-corpus-bar">
      <div>
        <p className="active-corpus-label">{t.activeCorpusBar.exploring}</p>
        <div className="active-corpus-title-row">
          <strong>{corpus.name}</strong>
          <span>v{corpus.version}</span>
        </div>
      </div>

      <div className="active-corpus-actions">
        <LanguageSelector />
        <Link className="change-corpus-link" href="/">
          {t.activeCorpusBar.changeCorpus}
        </Link>
      </div>
    </div>
  );
}
