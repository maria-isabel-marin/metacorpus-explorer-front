"use client";

import { useState, useMemo, useCallback } from "react";

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
};

export function MetaphorExplorer({
  metaphors,
  filters,
  corpusName,
}: MetaphorExplorerProps) {
  const { t } = useLanguage();
  const [selectedTypologies, setSelectedTypologies] = useState<MetaphorTypology[]>([]);
  const [selectedSourceDomain, setSelectedSourceDomain] = useState<string>("all");
  const [selectedTargetDomain, setSelectedTargetDomain] = useState<string>("all");
  const [selectedGrammaticalCategory, setSelectedGrammaticalCategory] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const handleTypologyChange = useCallback((typology: MetaphorTypology) => {
    setSelectedTypologies((prev) =>
      prev.includes(typology)
        ? prev.filter((typ) => typ !== typology)
        : [...prev, typology]
    );
  }, []);

  const handleSourceDomainChange = useCallback((domain: string) => {
    setSelectedSourceDomain(domain);
  }, []);

  const handleTargetDomainChange = useCallback((domain: string) => {
    setSelectedTargetDomain(domain);
  }, []);

  const handleGrammaticalCategoryChange = useCallback((category: string) => {
    setSelectedGrammaticalCategory(category);
  }, []);

  const filteredMetaphors = useMemo(() => {
    return filterMetaphors(metaphors, {
      typologies: selectedTypologies.length > 0 ? selectedTypologies : undefined,
      sourceDomain: selectedSourceDomain,
      targetDomain: selectedTargetDomain,
      grammaticalCategory: selectedGrammaticalCategory || undefined,
    });
  }, [
    metaphors,
    selectedTypologies,
    selectedSourceDomain,
    selectedTargetDomain,
    selectedGrammaticalCategory,
  ]);

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

  const totalCount = metaphors.length;
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
              {t.explorer.subtitle.replace("{count}", String(totalCount))}
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
      {(selectedTypologies.length > 0 ||
        selectedSourceDomain !== "all" ||
        selectedTargetDomain !== "all" ||
        selectedGrammaticalCategory !== "") && (
        <div className="filter-status">
          <span className="filter-status-text">
            {t.explorer.showing.replace("{filtered}", String(filteredCount)).replace("{total}", String(totalCount))}
          </span>
          <button
            className="clear-filters-btn"
            onClick={() => {
              setSelectedTypologies([]);
              setSelectedSourceDomain("all");
              setSelectedTargetDomain("all");
              setSelectedGrammaticalCategory("");
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
          selectedTypologies={selectedTypologies}
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
            <MetaphorTable metaphors={filteredMetaphors} />
          ) : (
            <MetaphorCards metaphors={filteredMetaphors} />
          )}
        </div>
      </div>
    </main>
  );
}

function MetaphorCards({ metaphors }: { metaphors: ConceptualMetaphor[] }) {
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
        <article key={metaphor.id} className="metaphor-card">
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
      ))}
    </div>
  );
}
