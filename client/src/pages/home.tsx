import { useQuery } from "@tanstack/react-query";
import { HeroSection } from "@/components/hero-section";
import { ContentRow } from "@/components/content-row";
import type { Content } from "@shared/schema";

const categoryLabels: Record<string, string> = {
  theatre_contemporain: "Théâtre contemporain",
  danse_montreal: "Danse de Montréal",
  concerts: "Concerts",
  litterature_essais: "Littérature & Essais",
  coup_de_coeur_diversite: "Coup de cœur Diversité",
};

export default function Home() {
  const { data: contents = [], isLoading } = useQuery<Content[]>({
    queryKey: ["/api/contents"],
  });

  const featured = contents.find((c) => c.featured);
  const categories = Object.entries(categoryLabels).map(([key, label]) => ({
    label,
    contents: contents.filter((c) => c.category === key),
  }));

  return (
    <div className="min-h-screen" data-testid="page-home">
      <HeroSection content={featured} isLoading={isLoading} />
      <div className="-mt-16 relative z-10 pb-16">
        {categories.map((cat) => (
          <ContentRow
            key={cat.label}
            title={cat.label}
            contents={cat.contents}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
