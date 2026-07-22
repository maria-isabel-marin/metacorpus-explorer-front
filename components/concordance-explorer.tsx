"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";

import type { CorpusSummary } from "@/lib/corpora";
import type { ApiExpression, ApiFilterOptions } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/language-context";

type SortOption = "orden" | "foco" | "contexto";

type ConcordanceExplorerProps = {
  corpus: CorpusSummary;
  expressions: ApiExpression[];
  total: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  activeTypology: string;
  filterOptions: ApiFilterOptions;
  sortBy?: SortOption;
};

const TYPOLOGY_COLORS: Record<string, string> = {
  ESTRUCTURAL: "#2563eb",
  ONTOLOGICA: "#8b5a2b",
  ORIENTACIONAL: "#16a34a",
  OTRA: "#6b7280",
};

export function ConcordanceExplorer({
  corpus,
  expressions,
  total,
  currentPage,
  pageSize,
  searchQuery,
  activeTypology,
  filterOptions,
  sortBy: initialSort = "orden",
}: ConcordanceExplorerProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState(searchQuery);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);

  const totalPages = Math.ceil(total / pageSize);
  const showingFrom = (currentPage - 1) * pageSize + 1;
  const showingTo = Math.min(currentPage * pageSize, total);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (activeTypology !== "all") params.set("tipologia", activeTypology);
    router.push(`/corpus/${corpus.slug}/concordance?${params.toString()}`);
  };

  const handleTypologyChange = (typology: string) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (typology !== "all") params.set("tipologia", typology);
    router.push(`/corpus/${corpus.slug}/concordance?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (activeTypology !== "all") params.set("tipologia", activeTypology);
    if (sortBy !== "orden") params.set("sort", sortBy);
    if (page > 1) params.set("page", String(page));
    router.push(`/corpus/${corpus.slug}/concordance?${params.toString()}`);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (activeTypology !== "all") params.set("tipologia", activeTypology);
    params.set("sort", newSort);
    router.push(`/corpus/${corpus.slug}/concordance?${params.toString()}`);
  };

  // Extract KWIC components from expression
  const extractKwic = (expr: ApiExpression) => {
    const fullText = expr.expresion_metaforica;
    const focus = expr.foco ?? "";
    
    if (!focus || !fullText.includes(focus)) {
      // Fallback: show first 40 chars as left, rest as right
      const left = fullText.slice(0, 40);
      const right = fullText.slice(40);
      return { left, focus: focus || "[...]", right };
    }

    const focusIndex = fullText.indexOf(focus);
    const left = fullText.slice(0, focusIndex).trim();
    const right = fullText.slice(focusIndex + focus.length).trim();
    
    return { left, focus, right };
  };

  // Client-side sorting of the current page of expressions
  const sortedExpressions = useMemo(() => {
    if (sortBy === "orden") {
      return [...expressions].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    }
    if (sortBy === "foco") {
      return [...expressions].sort((a, b) =>
        (a.foco ?? "").localeCompare(b.foco ?? "", undefined, { sensitivity: "base" })
      );
    }
    if (sortBy === "contexto") {
      // Sort by right context (text after the focus)
      const getRight = (expr: ApiExpression) => {
        const { right } = extractKwic(expr);
        return right;
      };
      return [...expressions].sort((a, b) =>
        getRight(a).localeCompare(getRight(b), undefined, { sensitivity: "base" })
      );
    }
    return expressions;
  }, [expressions, sortBy]);

  return (
    <main className="concordance-shell">
      {/* Header */}
      <header className="concordance-header">
        <div className="concordance-header-top">
          <span className="concordance-eyebrow">
            {t.concordance?.eyebrow || "EXPLORADOR"}
          </span>
        </div>
        <h1 className="concordance-title">
          {t.concordance?.title || "Concordancia"}{" "}
          <em className="kwic-em">KWIC</em>
        </h1>
        <p className="concordance-description">
          {t.concordance?.description ||
            "Keyword-in-Context. Foco centrado, contexto alineado. Colores por tipología. Ordenable por el campo Orden (secuencia textual)."}
        </p>
      </header>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="concordance-search">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.concordance?.searchPlaceholder || "Término de búsqueda (foco, expresión, texto libre)..."}
            className="concordance-search-input"
          />
        </div>
        <div className="search-controls">
          <div className="typology-select-wrapper">
            <select
              value={activeTypology}
              onChange={(e) => handleTypologyChange(e.target.value)}
              className="typology-select"
            >
              <option value="all">{t.concordance?.allTypologies || "Todas las tipologías"}</option>
              {filterOptions.typologies.map((typ) => (
                <option key={typ.name} value={typ.name}>
                  {typ.name}
                </option>
              ))}
            </select>
            <ChevronDown className="select-chevron" size={16} />
          </div>
          <button type="submit" className="search-button">
            {t.concordance?.search || "Buscar"}
          </button>
        </div>
      </form>

      {/* Legend */}
      <div className="concordance-legend">
        {Object.entries(TYPOLOGY_COLORS).map(([typology, color]) => (
          <div key={typology} className="legend-item">
            <span
              className="legend-dot"
              style={{ backgroundColor: color }}
            />
            <span className="legend-label">{typology}</span>
          </div>
        ))}
      </div>

      {/* Results info with sort dropdown */}
      <div className="concordance-results-info">
        <span className="results-count">
          {showingFrom}-{showingTo} {t.concordance?.of || "de"} {total} {t.concordance?.results || "concordancias"}
        </span>
        <div className="sort-control">
          <span className="sort-label">{t.concordance?.sortBy || "Ordenar"}:</span>
          <div className="sort-select-wrapper">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="sort-select"
            >
              <option value="orden">{t.concordance?.sortOrder || "ORDEN"}</option>
              <option value="foco">{t.concordance?.sortFocus || "FOCO"}</option>
              <option value="contexto">{t.concordance?.sortContext || "ctx. derecho"}</option>
            </select>
            <ChevronDown className="select-chevron-small" size={14} />
          </div>
        </div>
      </div>

      {/* Concordance table */}
      <div className="concordance-table-wrapper">
        <table className="concordance-table">
          <thead>
            <tr className="table-header-row">
              <th className="col-num">#</th>
              <th className="col-left">{t.concordance?.contextLeft || "Contexto Izquierdo"}</th>
              <th className="col-focus">{t.concordance?.focus || "Foco"}</th>
              <th className="col-right">{t.concordance?.contextRight || "Contexto Derecho"}</th>
              <th className="col-source">{t.concordance?.source || "Fuente"}</th>
              <th className="col-order">{t.concordance?.order || "Orden"}</th>
            </tr>
          </thead>
          <tbody>
            {sortedExpressions.map((expr, idx) => {
              const { left, focus, right } = extractKwic(expr);
              const typologyColor = TYPOLOGY_COLORS[expr.tipologia ?? "OTRA"] ?? TYPOLOGY_COLORS.OTRA;
              const globalIndex = (currentPage - 1) * pageSize + idx + 1;

              return (
                <tr key={expr.id} className="concordance-row">
                  <td className="col-num">{globalIndex}</td>
                  <td className="col-left" title={left}>
                    <Link
                      href={`/corpus/${corpus.slug}/concordance/${expr.id}`}
                      className="kwic-link"
                    >
                      <span className="context-text">{left}</span>
                    </Link>
                  </td>
                  <td className="col-focus">
                    <Link
                      href={`/corpus/${corpus.slug}/concordance/${expr.id}`}
                      className="kwic-link"
                    >
                      <span
                        className="focus-highlight"
                        style={{
                          backgroundColor: `${typologyColor}20`,
                          borderBottom: `2px solid ${typologyColor}`,
                          color: "var(--text)",
                        }}
                      >
                        {focus}
                      </span>
                    </Link>
                  </td>
                  <td className="col-right" title={right}>
                    <Link
                      href={`/corpus/${corpus.slug}/concordance/${expr.id}`}
                      className="kwic-link"
                    >
                      <span className="context-text">{right}</span>
                    </Link>
                  </td>
                  <td className="col-source">
                    <span className="source-text" title={expr.fuente_textual.titulo_1}>
                      {expr.fuente_textual.titulo_1.slice(0, 30)}
                      {expr.fuente_textual.titulo_1.length > 30 ? "..." : ""}
                    </span>
                  </td>
                  <td className="col-order">{expr.orden}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="concordance-pagination">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="pagination-button"
          >
            {t.concordance?.previous || "Anterior"}
          </button>
          <span className="pagination-info">
            {t.concordance?.page || "Página"} {currentPage} {t.concordance?.of || "de"} {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="pagination-button"
          >
            {t.concordance?.next || "Siguiente"}
          </button>
        </div>
      )}
    </main>
  );
}
