import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Play, Heart, Ticket, Clock, MapPin, Calendar, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Content, Favorite } from "@shared/schema";
import { useState, useEffect, useCallback } from "react";

export default function SpectacleDetail() {
  const [, params] = useRoute("/spectacle/:id");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);

  const trackEvent = useCallback(async (contentId: string, eventType: string, metadata?: any) => {
    try {
      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, eventType, metadata }),
      });
    } catch {}
  }, []);

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

  useEffect(() => {
    if (content?.id) {
      trackEvent(content.id, "page_view", { category: content.category });
    }
  }, [content?.id]);

  const handleTicketClick = () => {
    if (content?.id) {
      trackEvent(content.id, "ticket_click");
    }
  };

  const handlePlayClick = () => {
    setIsPlaying(true);
    if (content?.id) {
      trackEvent(content.id, "view_start", { category: content.category });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16" data-testid="spectacle-loading">
        <Skeleton className="w-full h-[60vh]" />
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <Skeleton className="w-64 h-10 mb-4" />
          <Skeleton className="w-full h-24" />
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center" data-testid="spectacle-not-found">
        <p className="text-muted-foreground">Contenu introuvable</p>
      </div>
    );
  }

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be")
        ? url.split("/").pop()
        : new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return url;
  };

  const formatDuration = (minutes?: number | null) => {
    if (!minutes) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ""}` : `${m} min`;
  };

  return (
    <div className="min-h-screen" data-testid="page-spectacle-detail">
      <div className="relative w-full h-[60vh] lg:h-[75vh] overflow-hidden">
        {isPlaying && content.videoUrl ? (
          <iframe
            src={getEmbedUrl(content.videoUrl)}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            data-testid="video-player"
          />
        ) : (
          <>
            <img
              src={content.thumbnailUrl}
              alt={content.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-black/30" />
            {content.videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handlePlayClick}
                  className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center transition-transform hover:scale-110"
                  data-testid="button-play-video"
                >
                  <Play className="w-8 h-8 text-primary-foreground fill-current ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 -mt-24 relative z-10 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4 flex-wrap">
              {content.isLive && (
                <Badge variant="destructive" className="text-sm">LIVE</Badge>
              )}
              <Badge variant="secondary" className="text-sm">
                {content.type === "video" ? "Vidéo" : "Livre"}
              </Badge>
            </div>
            <h1
              className="font-serif text-3xl lg:text-5xl font-bold mb-3"
              data-testid="text-spectacle-title"
            >
              {content.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-6" data-testid="text-spectacle-artist">
              {content.artist}
            </p>
            <div className="flex items-center gap-4 flex-wrap mb-8 text-sm text-muted-foreground">
              {content.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatDuration(content.duration)}
                </span>
              )}
              {content.venue && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {content.venue}
                </span>
              )}
              {content.year && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {content.year}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap mb-8">
              {content.videoUrl && !isPlaying && (
                <Button size="lg" className="gap-2" onClick={() => setIsPlaying(true)} data-testid="button-play">
                  <Play className="w-5 h-5 fill-current" />
                  Regarder
                </Button>
              )}
              {content.ticketUrl && (
                <a href={content.ticketUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="default" className="gap-2 bg-primary" data-testid="button-buy-ticket" onClick={handleTicketClick}>
                    <Ticket className="w-5 h-5" />
                    ACHETER UN BILLET
                  </Button>
                </a>
              )}
              <Button
                size="icon"
                variant="outline"
                onClick={() => toggleFavorite.mutate()}
                className={isFavorited ? "text-primary border-primary" : ""}
                data-testid="button-favorite"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
              </Button>
              <Button size="icon" variant="outline" data-testid="button-share">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-foreground/80 leading-relaxed text-base" data-testid="text-spectacle-description">
                {content.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
