import { redirect } from "next/navigation";

type CorpusEntryPageProps = {
  params: {
    slug: string;
  };
};

export default function CorpusEntryPage({ params }: CorpusEntryPageProps) {
  redirect(`/corpus/${params.slug}/dashboard`);
}
