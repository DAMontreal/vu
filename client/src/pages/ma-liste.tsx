import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { ContentCard } from "@/components/content-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Content, Favorite } from "@shared/schema";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function MaListe() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour accéder à votre liste.", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, authLoading]);

  const { data: favorites = [], isLoading } = useQuery<(Favorite & { content: Content })[]>({
    queryKey: ["/api/favorites/with-content"],
    enabled: isAuthenticated,
  });

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Skeleton className="w-64 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="page-ma-liste">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-8" data-testid="text-ma-liste-title">
          Ma Liste
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-md" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Votre liste est vide</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Ajoutez des spectacles et des livres à votre liste pour les retrouver facilement.
            </p>
            <Link href="/">
              <Button data-testid="button-explore">Explorer</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favorites.map((fav) => (
              <ContentCard key={fav.id} content={fav.content} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
