"use client";

import Link from "next/link";

import type { CorpusSummary } from "@/lib/corpora";
import { useLanguage } from "@/lib/i18n/language-context";
import { LanguageSelector } from "./language-selector";

type CorpusSelectorProps = {
  corpora: CorpusSummary[];
};

export function CorpusSelector({ corpora }: CorpusSelectorProps) {
  const { locale, t } = useLanguage();

  function formatExpressions(value: number) {
    return new Intl.NumberFormat(locale === "es" ? "es-CO" : "en-US").format(value);
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat(locale === "es" ? "es-CO" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(value));
  }

  return (
    <main className="selector-shell">
      <section className="selector-hero">
        <div className="selector-hero-top">
          <h1 className="selector-title">
            Meta<span>Corpus</span> Explorer
          </h1>
          <LanguageSelector />
        </div>
        <p className="selector-description">
          {t.landing.description}
        </p>
      </section>

      <section className="selector-grid" aria-label="Corpus disponibles">
        {corpora.map((corpus) => (
          <article key={corpus.slug} className="corpus-card">
            <div className="corpus-card-top">
              <p className="corpus-code">{corpus.shortCode}</p>
              <h2 className="corpus-name">{corpus.name}</h2>
              <p className="corpus-copy">{corpus.description}</p>
            </div>

            <div className="corpus-badges">
              <span className="badge badge-soft">{corpus.language}</span>
              <span className="badge">v{corpus.version}</span>
              <span className="badge badge-accent">{corpus.license}</span>
            </div>

            <dl className="corpus-metrics">
              <div>
                <dt>{t.landing.expressions}</dt>
                <dd>{formatExpressions(corpus.expressions)}</dd>
              </div>
              <div>
                <dt>{t.landing.metaphors}</dt>
                <dd>{formatExpressions(corpus.metaphors)}</dd>
              </div>
              <div>
                <dt>{t.landing.sourceDomains}</dt>
                <dd>{formatExpressions(corpus.sourceDomains)}</dd>
              </div>
              <div>
                <dt>{t.landing.targetDomains}</dt>
                <dd>{formatExpressions(corpus.targetDomains)}</dd>
              </div>
            </dl>

            <div className="corpus-card-footer">
              <div>
                <p className="corpus-date-label">{t.landing.published}</p>
                <p className="corpus-date">{formatDate(corpus.publicationDate)}</p>
              </div>
              <Link
                className="explore-link"
                href={`/corpus/${corpus.slug}/dashboard`}
              >
                {t.landing.explore}
              </Link>
            </div>
          </article>
        ))}
      </section>

      <footer className="selector-footer">
        <span>{t.landing.footerMipvu}</span>
        <span>{t.landing.footerOpen}</span>
      </footer>
    </main>
  );
}
