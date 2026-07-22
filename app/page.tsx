import { redirect } from "next/navigation";

import { CorpusSelector } from "@/components/corpus-selector";
import { getAllCorpora, getCorpusBySlug } from "@/lib/corpora";

export default async function HomePage() {
  const list = await getAllCorpora();

  if (list.length === 1) {
    redirect(`/corpus/${list[0].slug}/dashboard`);
  }

  const corpora = await Promise.all(
    list.map(async (c, i) => {
      const detail = await getCorpusBySlug(c.slug, i);
      return detail ?? c;
    })
  );

  return <CorpusSelector corpora={corpora} />;
}
