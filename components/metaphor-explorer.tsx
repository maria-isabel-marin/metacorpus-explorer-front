"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { MetaphorFilters } from "./metaphor-filters";
import { MetaphorTable } from "./metaphor-table";
import { useLanguage } from "@/lib/i18n/language-context";

import type {
  ConceptualMetaphor,
  FilterOptions,
  MetaphorTypology,
} from "@/lib/metaphors";
import { filterMetaphors, downloadMetaphorsAsCSV } from "@/lib/metaphors";

type ViewMode = "table" | "cards";

type MetaphorExplorerProps = {
  metaphors: ConceptualMetaphor[];
  filters: FilterOptions;
  corpusName: string;
  corpusSlug: string;
  currentPage: number;
  totalPages: number;
  total: number;
  activeTypology?: string;
  activeCatGramatical?: string;
};

export function MetaphorExplorer({
  metaphors,
  filters,
  corpusName,
  corpusSlug,
  currentPage,
  totalPages,
  total,
  activeTypology = "",
  activeCatGramatical = "",
}: MetaphorExplorerProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedTypology, setSelectedTypology] = useState<string>(activeTypology);
  const [selectedSourceDomain, setSelectedSourceDomain] = useState<string>("all");
  const [selectedTargetDomain, setSelectedTargetDomain] = useState<string>("all");
  const [selectedGrammaticalCategory, setSelectedGrammaticalCategory] = useState<string>(activeCatGramatical);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const navigate = useCallback((overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    const typ = overrides.tipologia ?? selectedTypology;
    const cat = overrides.cat_gramatical ?? selectedGrammaticalCategory;
    if (typ) params.set("tipologia", typ);
    if (cat) params.set("cat_gramatical", cat);
    router.push(`/corpus/${corpusSlug}/metaphors?${params.toString()}`);
  }, [router, corpusSlug, selectedTypology, selectedGrammaticalCategory]);

  const handleTypologyChange = useCallback((typology: MetaphorTypology) => {
    const next = selectedTypology === typology ? "" : typology;
    setSelectedTypology(next);
    navigate({ tipologia: next });
  }, [selectedTypology, navigate]);

  const handleSourceDomainChange = useCallback((domain: string) => {
    setSelectedSourceDomain(domain);
  }, []);

  const handleTargetDomainChange = useCallback((domain: string) => {
    setSelectedTargetDomain(domain);
  }, []);

  const handleGrammaticalCategoryChange = useCallback((category: string) => {
    const next = selectedGrammaticalCategory === category ? "" : category;
    setSelectedGrammaticalCategory(next);
    navigate({ cat_gramatical: next });
  }, [selectedGrammaticalCategory, navigate]);

  const filteredMetaphors = useMemo(() => {
    return filterMetaphors(metaphors, {
      sourceDomain: selectedSourceDomain,
      targetDomain: selectedTargetDomain,
    });
  }, [metaphors, selectedSourceDomain, selectedTargetDomain]);

  const handleDownloadCSV = useCallback(() => {
    const csv = downloadMetaphorsAsCSV(filteredMetaphors);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `metáforas-${corpusName.toLowerCase().replace(/\s+/g, "-")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredMetaphors, corpusName]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (selectedTypology) params.set("tipologia", selectedTypology);
      if (selectedGrammaticalCategory) params.set("cat_gramatical", selectedGrammaticalCategory);
      router.push(`/corpus/${corpusSlug}/metaphors?${params.toString()}`);
    }
  };

  const pageSize = 50;
  const showingFrom = (currentPage - 1) * pageSize + 1;
  const showingTo = Math.min(currentPage * pageSize, total);
  const filteredCount = filteredMetaphors.length;

  return (
    <main className="metaphor-explorer-shell">
      {/* Header */}
      <header className="metaphor-explorer-header">
        <div className="metaphor-explorer-title-row">
          <div>
            <p className="metaphor-explorer-eyebrow">{t.explorer.eyebrow}</p>
            <h1 className="metaphor-explorer-title">{t.explorer.title}</h1>
            <p className="metaphor-explorer-subtitle">
              {t.explorer.subtitle.replace("{count}", String(total))}
            </p>
          </div>
        </div>

        {/* View Controls */}
        <div className="metaphor-view-controls">
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              aria-label={t.explorer.tableViewLabel}
            >
              <span className="view-icon">≡</span>
              <span>{t.explorer.tableView}</span>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === "cards" ? "active" : ""}`}
              onClick={() => setViewMode("cards")}
              aria-label={t.explorer.cardsViewLabel}
            >
              <span className="view-icon">▦</span>
              <span>{t.explorer.cardsView}</span>
            </button>
          </div>
          <button
            className="download-btn"
            onClick={handleDownloadCSV}
            aria-label={t.explorer.downloadCsvLabel}
          >
            <span className="download-icon">↓</span>
            <span>{t.explorer.downloadCsv}</span>
          </button>
        </div>
      </header>

      {/* Filter Status */}
      {(selectedTypology !== "" ||
        selectedSourceDomain !== "all" ||
        selectedTargetDomain !== "all" ||
        selectedGrammaticalCategory !== "") && (
        <div className="filter-status">
          <span className="filter-status-text">
            {t.explorer.showing.replace("{filtered}", String(filteredCount)).replace("{total}", String(total))}
          </span>
          <button
            className="clear-filters-btn"
            onClick={() => {
              setSelectedTypology("");
              setSelectedSourceDomain("all");
              setSelectedTargetDomain("all");
              setSelectedGrammaticalCategory("");
              router.push(`/corpus/${corpusSlug}/metaphors?page=1`);
            }}
          >
            {t.explorer.clearFilters}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="metaphor-explorer-content">
        <MetaphorFilters
          filters={filters}
          selectedTypologies={selectedTypology ? [selectedTypology] : []}
          selectedSourceDomain={selectedSourceDomain}
          selectedTargetDomain={selectedTargetDomain}
          selectedGrammaticalCategory={selectedGrammaticalCategory}
          onTypologyChange={handleTypologyChange}
          onSourceDomainChange={handleSourceDomainChange}
          onTargetDomainChange={handleTargetDomainChange}
          onGrammaticalCategoryChange={handleGrammaticalCategoryChange}
        />

        <div className="metaphor-results">
          {viewMode === "table" ? (
            <MetaphorTable metaphors={filteredMetaphors} corpusSlug={corpusSlug} />
          ) : (
            <MetaphorCards metaphors={filteredMetaphors} corpusSlug={corpusSlug} />
          )}
        </div>
      </div>

      {/* Pagination - fuera del grid de contenido */}
      {totalPages > 1 && (
        <div className="metaphor-pagination-wrapper">
          <div className="metaphor-pagination">
            <div className="pagination-info">
              <span>{showingFrom}-{showingTo} de {total} metáforas</span>
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="pagination-button"
              >
                ← Anterior
              </button>
              <span className="pagination-current">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="pagination-button"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MetaphorCards({ metaphors, corpusSlug }: { metaphors: ConceptualMetaphor[]; corpusSlug: string }) {
  const { t } = useLanguage();

  if (metaphors.length === 0) {
    return (
      <div className="metaphor-empty-state">
        <p>{t.explorer.noResults}</p>
      </div>
    );
  }

  return (
    <div className="metaphor-cards-grid">
      {metaphors.map((metaphor) => (
        <Link
          key={metaphor.id}
          href={`/corpus/${corpusSlug}/metaphors/${metaphor.id}`}
          className="metaphor-card-link"
        >
          <article className="metaphor-card">
            <h3 className="metaphor-card-formula">{metaphor.formula}</h3>
            <div className="metaphor-card-domains">
              <div className="metaphor-card-domain">
                <span className="domain-label">{t.explorer.source}</span>
                <span className="domain-badge source">{metaphor.sourceDomain}</span>
              </div>
              <div className="metaphor-card-domain">
                <span className="domain-label">{t.explorer.target}</span>
                <span className="domain-badge target">{metaphor.targetDomain}</span>
              </div>
            </div>
            <div className="metaphor-card-meta">
              <span className={`typology-badge typology-${metaphor.typology.toLowerCase()}`}>
                {metaphor.typology}
              </span>
              <span className="expressions-count">{t.explorer.expressionsCount.replace("{count}", String(metaphor.expressions))}</span>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
