"use client";

import Link from "next/link";
import type { ConceptualMetaphor } from "@/lib/metaphors";
import { useLanguage } from "@/lib/i18n/language-context";

type MetaphorTableProps = {
  metaphors: ConceptualMetaphor[];
  corpusSlug: string;
};

export function MetaphorTable({ metaphors, corpusSlug }: MetaphorTableProps) {
  const { t } = useLanguage();

  if (metaphors.length === 0) {
    return (
      <div className="metaphor-empty-state">
        <p>{t.table.noResults}</p>
      </div>
    );
  }

  return (
    <div className="metaphor-table-container">
      <table className="metaphor-table">
        <thead>
          <tr>
            <th className="metaphor-col-metaphor">{t.table.conceptualMetaphor}</th>
            <th className="metaphor-col-domain">{t.table.sourceDomain}</th>
            <th className="metaphor-col-domain">{t.table.targetDomain}</th>
            <th className="metaphor-col-typology">{t.table.typology}</th>
            <th className="metaphor-col-expressions">{t.table.expressions}</th>
          </tr>
        </thead>
        <tbody>
          {metaphors.map((metaphor) => (
            <tr key={metaphor.id} className="metaphor-row">
              <td className="metaphor-cell-formula">
                <Link
                  href={`/corpus/${corpusSlug}/metaphors/${metaphor.id}`}
                  className="metaphor-formula-link"
                >
                  <span className="metaphor-formula">{metaphor.formula}</span>
                </Link>
              </td>
              <td className="metaphor-cell-domain">
                <span className="domain-badge source">{metaphor.sourceDomain}</span>
              </td>
              <td className="metaphor-cell-domain">
                <span className="domain-badge target">{metaphor.targetDomain}</span>
              </td>
              <td className="metaphor-cell-typology">
                <span className={`typology-badge typology-${metaphor.typology.toLowerCase()}`}>
                  {metaphor.typology}
                </span>
              </td>
              <td className="metaphor-cell-expressions">
                <Link
                  href={`/corpus/${corpusSlug}/metaphors/${metaphor.id}`}
                  className="expressions-count-link"
                >
                  <span className="expressions-count">{metaphor.expressions}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
