import { useQuery } from "@tanstack/react-query";
import { HeroSection } from "@/components/hero-section";
import { ContentRow } from "@/components/content-row";
import { ContentCard } from "@/components/content-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Quote, MapPin, Award } from "lucide-react";
import { Link } from "wouter";
import type { Content } from "@shared/schema";

interface CurationData {
  id: string;
  artistName: string;
  artistBio: string;
  artistImageUrl: string | null;
  month: number;
  year: number;
  items: { id: string; content: Content; note: string | null }[];
}

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

  const { data: curation } = useQuery<CurationData>({
    queryKey: ["/api/curation/active"],
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
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 mb-8">
          <div className="flex gap-3 flex-wrap">
            <Link href="/carte">
              <Button variant="outline" className="gap-2 backdrop-blur-sm bg-background/50" data-testid="link-carte-home">
                <MapPin className="w-4 h-4" />
                Carte de Montréal
              </Button>
            </Link>
            <Link href="/passeport">
              <Button variant="outline" className="gap-2 backdrop-blur-sm bg-background/50" data-testid="link-passeport-home">
                <Award className="w-4 h-4" />
                Passeport Culturel
              </Button>
            </Link>
          </div>
        </div>

        {curation && curation.items && curation.items.length > 0 && (
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 mb-8">
            <Link href="/carte-blanche">
              <Card className="p-5 hover-elevate cursor-pointer bg-gradient-to-r from-primary/10 to-transparent" data-testid="card-carte-blanche">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0">
                    <img
                      src={curation.artistImageUrl || "/images/theatre-1.png"}
                      alt={curation.artistName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge className="mb-1 no-default-hover-elevate no-default-active-elevate">
                      <Star className="w-3 h-3 mr-1" />
                      Carte Blanche
                    </Badge>
                    <p className="text-sm">
                      Ce mois-ci, l'application est configurée par{" "}
                      <span className="font-bold text-primary">{curation.artistName}</span>
                    </p>
                  </div>
                  <Quote className="w-5 h-5 text-primary flex-shrink-0" />
                </div>
              </Card>
            </Link>
          </div>
        )}

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
