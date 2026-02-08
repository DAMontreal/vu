import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentCard } from "@/components/content-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Content } from "@shared/schema";

const venues = [
  "Théâtre du Nouveau Monde",
  "Place des Arts",
  "Usine C",
  "Espace Go",
  "Théâtre Denise-Pelletier",
];

const durations = [
  { label: "Moins de 60 min", max: 60 },
  { label: "60 à 90 min", min: 60, max: 90 },
  { label: "90 à 120 min", min: 90, max: 120 },
  { label: "Plus de 120 min", min: 120 },
];

export default function Recherche() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: contents = [], isLoading } = useQuery<Content[]>({
    queryKey: ["/api/contents"],
  });

  const filteredContents = contents.filter((c) => {
    const matchesSearch =
      !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.artist.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVenue =
      !selectedVenue || selectedVenue === "all" || c.venue === selectedVenue;

    let matchesDuration = true;
    if (selectedDuration && selectedDuration !== "all") {
      const dur = durations.find((d) => d.label === selectedDuration);
      if (dur && c.duration) {
        if (dur.min && dur.max) matchesDuration = c.duration >= dur.min && c.duration < dur.max;
        else if (dur.max) matchesDuration = c.duration < dur.max;
        else if (dur.min) matchesDuration = c.duration >= dur.min;
      } else if (!c.duration) {
        matchesDuration = false;
      }
    }

    return matchesSearch && matchesVenue && matchesDuration;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedVenue("");
    setSelectedDuration("");
  };

  const hasFilters = searchTerm || selectedVenue || selectedDuration;

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="page-recherche">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-8" data-testid="text-recherche-title">
          Recherche
        </h1>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par artiste, titre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
          >
            <Filter className="w-4 h-4" />
            Filtres
          </Button>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              data-testid="button-clear-filters"
            >
              <X className="w-4 h-4 mr-1" />
              Effacer
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 flex-wrap mb-6 p-4 bg-card rounded-md">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Lieu</label>
              <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                <SelectTrigger className="w-[220px]" data-testid="select-venue">
                  <SelectValue placeholder="Tous les lieux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les lieux</SelectItem>
                  {venues.map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Durée</label>
              <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                <SelectTrigger className="w-[180px]" data-testid="select-duration">
                  <SelectValue placeholder="Toutes durées" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes durées</SelectItem>
                  {durations.map((d) => (
                    <SelectItem key={d.label} value={d.label}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {hasFilters && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Recherche: {searchTerm}
              </Badge>
            )}
            {selectedVenue && selectedVenue !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Lieu: {selectedVenue}
              </Badge>
            )}
            {selectedDuration && selectedDuration !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Durée: {selectedDuration}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {filteredContents.length} résultat{filteredContents.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-md" />
            ))}
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Search className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucun résultat</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Essayez de modifier vos critères de recherche ou vos filtres.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredContents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
