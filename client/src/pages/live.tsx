import { useQuery } from "@tanstack/react-query";
import { ContentCard } from "@/components/content-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio } from "lucide-react";
import type { Content } from "@shared/schema";

export default function Live() {
  const { data: contents = [], isLoading } = useQuery<Content[]>({
    queryKey: ["/api/contents"],
  });

  const liveContents = contents.filter((c) => c.isLive || c.category === "spectacles_live");

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="page-live">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Radio className="w-8 h-8 text-primary" />
          <h1 className="font-serif text-3xl lg:text-4xl font-bold" data-testid="text-live-title">
            Spectacles en Live
          </h1>
        </div>
        <p className="text-muted-foreground mb-8 max-w-xl">
          Assistez en direct aux performances des artistes depuis chez vous.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-md" />
            ))}
          </div>
        ) : liveContents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Radio className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucun spectacle en direct</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Il n'y a pas de spectacle en direct pour le moment. Revenez bientôt pour découvrir les prochaines diffusions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {liveContents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
