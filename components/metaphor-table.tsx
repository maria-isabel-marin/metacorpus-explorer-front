import type { ConceptualMetaphor } from "@/lib/metaphors";

type MetaphorTableProps = {
  metaphors: ConceptualMetaphor[];
};

export function MetaphorTable({ metaphors }: MetaphorTableProps) {
  if (metaphors.length === 0) {
    return (
      <div className="metaphor-empty-state">
        <p>No se encontraron metáforas con los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="metaphor-table-container">
      <table className="metaphor-table">
        <thead>
          <tr>
            <th className="metaphor-col-metaphor">Metáfora Conceptual</th>
            <th className="metaphor-col-domain">Dominio Fuente</th>
            <th className="metaphor-col-domain">Dominio Meta</th>
            <th className="metaphor-col-typology">Tipología</th>
            <th className="metaphor-col-expressions">Expresiones</th>
          </tr>
        </thead>
        <tbody>
          {metaphors.map((metaphor) => (
            <tr key={metaphor.id} className="metaphor-row">
              <td className="metaphor-cell-formula">
                <span className="metaphor-formula">{metaphor.formula}</span>
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
                <span className="expressions-count">{metaphor.expressions}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
