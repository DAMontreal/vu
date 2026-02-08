import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { BookOpen, Heart, Share2, Clock, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Content, Favorite } from "@shared/schema";

export default function LivreDetail() {
  const [, params] = useRoute("/livre/:id");
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: content, isLoading } = useQuery<Content>({
    queryKey: ["/api/contents", params?.id],
    enabled: !!params?.id,
  });

  const { data: favorites = [] } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  const isFavorited = favorites.some((f) => f.contentId === params?.id);

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        await apiRequest("DELETE", `/api/favorites/${params?.id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { contentId: params?.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Veuillez vous connecter.", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24" data-testid="livre-loading">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <Skeleton className="w-64 h-96 rounded-md" />
            <div className="flex-1">
              <Skeleton className="w-64 h-10 mb-4" />
              <Skeleton className="w-full h-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center" data-testid="livre-not-found">
        <p className="text-muted-foreground">Livre introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="page-livre-detail">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="flex-shrink-0">
            <div className="w-64 lg:w-72 mx-auto lg:mx-0">
              <img
                src={content.thumbnailUrl}
                alt={content.title}
                className="w-full rounded-md shadow-2xl"
                data-testid="img-book-cover"
              />
            </div>
          </div>

          <div className="flex-1">
            <Badge variant="secondary" className="mb-3">Littérature</Badge>
            <h1
              className="font-serif text-3xl lg:text-4xl font-bold mb-3"
              data-testid="text-livre-title"
            >
              {content.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-6" data-testid="text-livre-artist">
              {content.artist}
            </p>

            <div className="flex items-center gap-4 flex-wrap mb-6 text-sm text-muted-foreground">
              {content.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {content.duration} pages
                </span>
              )}
              {content.year && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {content.year}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {content.artist}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap mb-8">
              <Button size="lg" className="gap-2" data-testid="button-read-book">
                <BookOpen className="w-5 h-5" />
                Lire l'extrait
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => toggleFavorite.mutate()}
                className={isFavorited ? "text-primary border-primary" : ""}
                data-testid="button-favorite-book"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
              </Button>
              <Button size="icon" variant="outline" data-testid="button-share-book">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-foreground/80 leading-relaxed mb-8" data-testid="text-livre-description">
              {content.description}
            </p>

            <Card className="p-6">
              <h3 className="font-serif text-lg font-semibold mb-4">Liseuse</h3>
              <div className="bg-muted rounded-md p-8 min-h-[300px] flex items-center justify-center">
                <div className="text-center space-y-3">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground text-sm">
                    Cliquez sur "Lire l'extrait" pour commencer la lecture
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
