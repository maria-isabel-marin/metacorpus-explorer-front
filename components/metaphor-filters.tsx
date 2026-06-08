"use client";

import type { FilterOptions, MetaphorTypology } from "@/lib/metaphors";
import { useLanguage } from "@/lib/i18n/language-context";

type MetaphorFiltersProps = {
  filters: FilterOptions;
  selectedTypologies: MetaphorTypology[];
  selectedSourceDomain: string;
  selectedTargetDomain: string;
  selectedGrammaticalCategory: string;
  onTypologyChange: (typology: MetaphorTypology) => void;
  onSourceDomainChange: (domain: string) => void;
  onTargetDomainChange: (domain: string) => void;
  onGrammaticalCategoryChange: (category: string) => void;
};

export function MetaphorFilters({
  filters,
  selectedTypologies,
  selectedSourceDomain,
  selectedTargetDomain,
  selectedGrammaticalCategory,
  onTypologyChange,
  onSourceDomainChange,
  onTargetDomainChange,
  onGrammaticalCategoryChange,
}: MetaphorFiltersProps) {
  const { t } = useLanguage();

  return (
    <aside className="metaphor-filters">
      {/* Typology Filter */}
      <div className="filter-section">
        <h3 className="filter-section-title">{t.filters.typology}</h3>
        <div className="filter-options">
          {filters.typologies.map((typology) => (
            <label key={typology.name} className="filter-checkbox-label">
              <input
                type="checkbox"
                className="filter-checkbox"
                checked={selectedTypologies.includes(typology.name)}
                onChange={() => onTypologyChange(typology.name)}
              />
              <span className="filter-checkbox-text">{capitalizeFirst(typology.name.toLowerCase())}</span>
              <span className="filter-count">{typology.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Source Domain Filter */}
      <div className="filter-section">
        <h3 className="filter-section-title">{t.filters.sourceDomain}</h3>
        <select
          className="filter-select"
          value={selectedSourceDomain}
          onChange={(e) => onSourceDomainChange(e.target.value)}
        >
          <option value="all">{t.filters.any}</option>
          {filters.sourceDomains.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
      </div>

      {/* Target Domain Filter */}
      <div className="filter-section">
        <h3 className="filter-section-title">{t.filters.targetDomain}</h3>
        <select
          className="filter-select"
          value={selectedTargetDomain}
          onChange={(e) => onTargetDomainChange(e.target.value)}
        >
          <option value="all">{t.filters.any}</option>
          {filters.targetDomains.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
      </div>

      {/* Grammatical Category Filter */}
      <div className="filter-section">
        <h3 className="filter-section-title">{t.filters.grammaticalCategory}</h3>
        <div className="filter-options">
          {filters.grammaticalCategories.map((category) => (
            <label key={category.name} className="filter-checkbox-label">
              <input
                type="checkbox"
                className="filter-checkbox"
                checked={selectedGrammaticalCategory === category.name}
                onChange={() => onGrammaticalCategoryChange(
                  selectedGrammaticalCategory === category.name ? "" : category.name
                )}
              />
              <span className="filter-checkbox-text">{category.name}</span>
              <span className="filter-count">{category.count}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
