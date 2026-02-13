import { useQuery } from "@tanstack/react-query";
import { ContentCard } from "@/components/content-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";
import type { Content } from "@shared/schema";

interface CurationData {
  id: string;
  title: string;
  artistName: string;
  artistBio: string;
  artistImageUrl: string | null;
  month: number;
  year: number;
  active: boolean;
  items: {
    id: string;
    contentId: string;
    note: string | null;
    sortOrder: number | null;
    content: Content;
  }[];
}

const monthNames = [
  "Janvier", "F\u00e9vrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Ao\u00fbt", "Septembre", "Octobre", "Novembre", "D\u00e9cembre",
];

export default function CarteBlanche() {
  const { data: curation, isLoading } = useQuery<CurationData>({
    queryKey: ["/api/curation/active"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <Skeleton className="h-64 w-full rounded-md mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!curation) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col items-center justify-center py-24">
            <Star className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucune Carte Blanche active</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Revenez bient\u00f4t pour d\u00e9couvrir la prochaine s\u00e9lection d'un artiste invit\u00e9.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16" data-testid="page-carte-blanche">
      <div className="relative bg-gradient-to-b from-primary/20 to-background py-16 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary/30 flex-shrink-0">
              <img
                src={curation.artistImageUrl || "/images/theatre-1.png"}
                alt={curation.artistName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center md:text-left">
              <Badge className="mb-3 no-default-hover-elevate no-default-active-elevate">
                <Star className="w-3 h-3 mr-1" />
                Carte Blanche \u2014 {monthNames[(curation.month || 1) - 1]} {curation.year}
              </Badge>
              <h1 className="font-serif text-3xl lg:text-5xl font-bold mb-3" data-testid="text-carte-blanche-artist">
                {curation.artistName}
              </h1>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">
                {curation.artistBio}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
        <h2 className="font-serif text-2xl font-bold mb-2">
          Ses coups de c\u0153ur
        </h2>
        <p className="text-muted-foreground mb-8">
          La s\u00e9lection personnelle de {curation.artistName} pour ce mois-ci.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {curation.items.map((item) => (
            <div key={item.id} className="flex flex-col gap-3">
              <ContentCard content={item.content} />
              {item.note && (
                <div className="flex gap-2 px-2">
                  <Quote className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    {item.note}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
