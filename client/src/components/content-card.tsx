import { Link } from "wouter";
import { Play, BookOpen, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Content } from "@shared/schema";

interface ContentCardProps {
  content: Content;
}

export function ContentCard({ content }: ContentCardProps) {
  const detailPath = content.type === "book" ? `/livre/${content.id}` : `/spectacle/${content.id}`;

  return (
    <Link href={detailPath}>
      <div
        className="flex-shrink-0 w-[160px] lg:w-[220px] group/card cursor-pointer relative"
        data-testid={`card-content-${content.id}`}
      >
        <div className="relative aspect-[2/3] rounded-md overflow-hidden mb-2">
          <img
            src={content.thumbnailUrl}
            alt={content.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2">
              {content.type === "video" ? (
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-black" />
                </div>
              )}
            </div>
          </div>
          {content.isLive && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="gap-1 text-xs">
                <Radio className="w-3 h-3" />
                LIVE
              </Badge>
            </div>
          )}
        </div>
        <h3
          className="text-sm font-medium line-clamp-1 group-hover/card:text-primary transition-colors"
          data-testid={`text-content-title-${content.id}`}
        >
          {content.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{content.artist}</p>
      </div>
    </Link>
  );
}
