import Link from "next/link";

import type { CorpusSummary } from "@/lib/corpora";

type ActiveCorpusBarProps = {
  corpus: CorpusSummary;
};

export function ActiveCorpusBar({ corpus }: ActiveCorpusBarProps) {
  return (
    <div className="active-corpus-bar">
      <div>
        <p className="active-corpus-label">Explorando</p>
        <div className="active-corpus-title-row">
          <strong>{corpus.name}</strong>
          <span>v{corpus.version}</span>
        </div>
      </div>

      <Link className="change-corpus-link" href="/">
        Cambiar corpus
      </Link>
    </div>
  );
}
