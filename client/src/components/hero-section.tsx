import { Play, Info, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Content } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface HeroSectionProps {
  content?: Content;
  isLoading?: boolean;
}

export function HeroSection({ content, isLoading }: HeroSectionProps) {
  if (isLoading || !content) {
    return (
      <div className="relative w-full h-[70vh] lg:h-[85vh]" data-testid="hero-loading">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[70vh] lg:h-[85vh] overflow-hidden" data-testid="hero-section">
      <div className="absolute inset-0">
        <img
          src={content.thumbnailUrl}
          alt={content.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-16 pb-16 lg:pb-24">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-primary font-medium text-sm lg:text-base mb-2 tracking-wider uppercase">
            Spectacle du mois
          </p>
          <h1
            className="font-serif text-4xl lg:text-6xl xl:text-7xl font-bold mb-4 max-w-2xl leading-tight text-white"
            data-testid="text-hero-title"
          >
            {content.title}
          </h1>
          <p className="text-white/80 text-sm lg:text-base max-w-xl mb-6 line-clamp-3">
            {content.description}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href={`/spectacle/${content.id}`}>
              <Button size="lg" className="gap-2" data-testid="button-hero-play">
                <Play className="w-5 h-5 fill-current" />
                Regarder
              </Button>
            </Link>
            {content.ticketUrl && (
              <a href={content.ticketUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="gap-2 bg-white/10 backdrop-blur-sm text-white border-white/20" data-testid="button-hero-ticket">
                  <Ticket className="w-5 h-5" />
                  Acheter un billet
                </Button>
              </a>
            )}
            <Link href={`/spectacle/${content.id}`}>
              <Button size="icon" variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/20" data-testid="button-hero-info">
                <Info className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
