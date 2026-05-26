import { redirect } from "next/navigation";

import { CorpusSelector } from "@/components/corpus-selector";
import { getAllCorpora, getCorpusCount } from "@/lib/corpora";
import { fetchCorpusStats } from "@/lib/api";

export default async function HomePage() {
  const corpora = getAllCorpora();

  if (getCorpusCount() === 1) {
    const singleCorpus = corpora[0];
    redirect(`/corpus/${singleCorpus.slug}/dashboard`);
  }

  const enriched = await Promise.all(
    corpora.map(async (c) => {
      try {
        const stats = await fetchCorpusStats(c.slug);
        const s = stats.estadisticas_agregadas;
        return {
          ...c,
          expressions: s.numero_registros,
          metaphors: s.metaforas_conceptuales,
          sourceDomains: s.dominios_por_tipo?.FUENTE ?? 0,
          targetDomains: s.dominios_por_tipo?.META ?? 0,
          textualSources: s.fuentes_textuales,
          typologies: s.categorias_gramaticales,
        };
      } catch {
        return c;
      }
    })
  );

  return <CorpusSelector corpora={enriched} />;
}
