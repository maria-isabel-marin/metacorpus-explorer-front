import { notFound } from "next/navigation";

import { MetaphorExplorer } from "@/components/metaphor-explorer";
import { getCorpusBySlug } from "@/lib/corpora";
import {
  getMetaphorsByCorpusSlug,
  getFilterOptionsByCorpusSlug,
} from "@/lib/metaphors";

type MetaphorsPageProps = {
  params: {
    slug: string;
  };
};

export default function MetaphorsPage({ params }: MetaphorsPageProps) {
  const corpus = getCorpusBySlug(params.slug);

  if (!corpus) {
    return notFound();
  }

  const metaphors = getMetaphorsByCorpusSlug(params.slug);
  const filterOptions = getFilterOptionsByCorpusSlug(params.slug);

  return (
    <MetaphorExplorer
      metaphors={metaphors}
      filters={filterOptions}
      corpusName={corpus.name}
    />
  );
}
