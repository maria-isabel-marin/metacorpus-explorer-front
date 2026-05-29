"use client";

import Link from "next/link";

import type { CorpusSummary } from "@/lib/corpora";
import type { ConceptualMetaphor } from "@/lib/metaphors";
import { useLanguage } from "@/lib/i18n/language-context";
import { DomainMap } from "./domain-map";

type DashboardOverviewProps = {
  corpus: CorpusSummary;
  topMetaphors: ConceptualMetaphor[];
  allMetaphors: ConceptualMetaphor[];
};

export function DashboardOverview({ corpus, topMetaphors, allMetaphors }: DashboardOverviewProps) {
  const { locale, t } = useLanguage();

  function formatNumber(value: number) {
    return new Intl.NumberFormat(locale === "es" ? "es-CO" : "en-US").format(value);
  }

  return (
    <main className="dashboard-shell">
      {/* Header Section */}
      <section className="dashboard-header-section">
        <div className="dashboard-header-content">
          <p className="dashboard-eyebrow">{t.dashboard.activeCorpus}</p>
          <h1 className="dashboard-title">{corpus.name}</h1>
          <p className="dashboard-description">{corpus.description}</p>
        </div>

        <div className="dashboard-header-actions">
          <button className="dashboard-action-btn dashboard-action-btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            {t.dashboard.exportCorpus}
          </button>
          <button className="dashboard-action-btn dashboard-action-btn-primary">
            {t.dashboard.howToCite}
          </button>
        </div>
      </section>

      {/* Search Bar */}
      <section className="dashboard-search-section">
        <div className="dashboard-search-box">
          <svg className="dashboard-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={t.dashboard.searchPlaceholder}
            className="dashboard-search-input"
          />
          <button className="dashboard-search-shortcut">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Stats Grid - 6 metrics */}
      <section className="dashboard-stats-grid" aria-label={t.dashboard.statsLabel}>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">{t.dashboard.expressions}</p>
          <strong className="dashboard-stat-value">{formatNumber(corpus.expressions)}</strong>
          <span className="dashboard-stat-subtitle">{t.dashboard.expressionsSub}</span>
        </article>

        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">{t.dashboard.metaphors}</p>
          <strong className="dashboard-stat-value">{formatNumber(corpus.metaphors)}</strong>
          <span className="dashboard-stat-subtitle">{t.dashboard.metaphorsSub}</span>
        </article>

        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">{t.dashboard.sourceDomains}</p>
          <strong className="dashboard-stat-value">{formatNumber(corpus.sourceDomains)}</strong>
          <span className="dashboard-stat-subtitle">{t.dashboard.sourceDomainsSub}</span>
        </article>

        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">{t.dashboard.targetDomains}</p>
          <strong className="dashboard-stat-value">{formatNumber(corpus.targetDomains)}</strong>
          <span className="dashboard-stat-subtitle">{t.dashboard.targetDomainsSub}</span>
        </article>

        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">{t.dashboard.textualSources}</p>
          <strong className="dashboard-stat-value">{formatNumber(corpus.textualSources)}</strong>
          <span className="dashboard-stat-subtitle">{t.dashboard.textualSourcesSub}</span>
        </article>

        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">{t.dashboard.typologies}</p>
          <strong className="dashboard-stat-value">{formatNumber(corpus.typologies)}</strong>
          <span className="dashboard-stat-subtitle">{t.dashboard.typologiesSub}</span>
        </article>
      </section>

      {/* Main Content - Map and Featured Metaphors */}
      <section className="dashboard-main-content">
        {/* Domain Map */}
        <article className="dashboard-map-card">
          <div className="dashboard-map-header">
            <h2>{t.dashboard.domainMap}</h2>
            <Link href={`/corpus/${corpus.slug}/map`} className="dashboard-map-link">
              {t.dashboard.openFullMap}
            </Link>
          </div>
          <div className="dashboard-map-visualization">
            <DomainMap metaphors={allMetaphors} />
          </div>
        </article>

        {/* Featured Metaphors */}
        <article className="dashboard-metaphors-card">
          <div className="dashboard-metaphors-header">
            <h2>{t.dashboard.featuredMetaphors}</h2>
            <span className="dashboard-metaphors-subtitle">{t.dashboard.sortedByFrequency}</span>
          </div>
          <ul className="dashboard-metaphors-list">
            {topMetaphors.map((metaphor) => (
              <li key={metaphor.id} className="dashboard-metaphor-item">
                <Link
                  href={`/corpus/${corpus.slug}/metaphors`}
                  className="dashboard-metaphor-link"
                >
                  <span className="dashboard-metaphor-formula">{metaphor.formula}</span>
                  <span className="dashboard-metaphor-count">{metaphor.expressions} {t.dashboard.expr}</span>
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Bottom Cards */}
      <section className="dashboard-bottom-cards">
        <Link href={`/corpus/${corpus.slug}/metaphors?filter=source`} className="dashboard-explore-card">
          <div className="dashboard-explore-content">
            <h3>{t.dashboard.exploreBySource}</h3>
            <p>{corpus.sourceDomains} {t.dashboard.domains}</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        <Link href={`/corpus/${corpus.slug}/metaphors?filter=target`} className="dashboard-explore-card">
          <div className="dashboard-explore-content">
            <h3>{t.dashboard.exploreByTarget}</h3>
            <p>{corpus.targetDomains} {t.dashboard.domains}</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        <Link href={`/corpus/${corpus.slug}/concordance`} className="dashboard-explore-card">
          <div className="dashboard-explore-content">
            <h3>{t.dashboard.kwicConcordance}</h3>
            <p>{t.dashboard.contextualSearch}</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </section>
    </main>
  );
}
