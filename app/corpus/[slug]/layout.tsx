import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { MainNavigation } from "@/components/main-navigation";
import { getCorpusBySlug } from "@/lib/corpora";

type CorpusLayoutProps = {
  children: ReactNode;
  params: {
    slug: string;
  };
};

export default function CorpusLayout({ children, params }: CorpusLayoutProps) {
  const corpus = getCorpusBySlug(params.slug);

  if (!corpus) {
    return notFound();
  }

  return (
    <div className="corpus-layout-shell">
      <MainNavigation corpus={corpus} />
      {children}
    </div>
  );
}
