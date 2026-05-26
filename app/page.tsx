import { redirect } from "next/navigation";

import { CorpusSelector } from "@/components/corpus-selector";
import { getAllCorpora, getCorpusCount } from "@/lib/corpora";

export default function HomePage() {
  const corpora = getAllCorpora();

  if (getCorpusCount() === 1) {
    const singleCorpus = corpora[0];
    redirect(`/corpus/${singleCorpus.slug}/dashboard`);
  }

  return <CorpusSelector corpora={corpora} />;
}
