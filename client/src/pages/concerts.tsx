import { useQuery } from "@tanstack/react-query";
import { ContentCard } from "@/components/content-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Music } from "lucide-react";
import type { Content } from "@shared/schema";

export default function Concerts() {
  const { data: contents = [], isLoading } = useQuery<Content[]>({
    queryKey: ["/api/contents"],
  });

  const concerts = contents.filter((c) => c.category === "concerts");

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="page-concerts">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Music className="w-8 h-8 text-primary" />
          <h1 className="font-serif text-3xl lg:text-4xl font-bold" data-testid="text-concerts-title">
            Concerts
          </h1>
        </div>
        <p className="text-muted-foreground mb-8 max-w-xl">
          Découvrez les meilleurs concerts de musique classique, jazz, chanson francophone et musique du monde à Montréal.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-md" />
            ))}
          </div>
        ) : concerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Music className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucun concert disponible</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Il n'y a pas de concert disponible pour le moment. Revenez bientôt pour découvrir les prochaines programmations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {concerts.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
