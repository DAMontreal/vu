import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentCard } from "./content-card";
import type { Content } from "@shared/schema";

interface ContentRowProps {
  title: string;
  contents: Content[];
  isLoading?: boolean;
}

export function ContentRow({ title, contents, isLoading }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 400);
  };

  if (isLoading) {
    return (
      <div className="mb-8 lg:mb-12">
        <h2 className="font-serif text-xl lg:text-2xl font-semibold mb-4 px-4 lg:px-8" data-testid={`text-row-title-loading`}>
          {title}
        </h2>
        <div className="flex gap-3 px-4 lg:px-8 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[160px] lg:w-[220px] aspect-[2/3] rounded-md bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!contents.length) return null;

  return (
    <div className="mb-8 lg:mb-12 group/row relative">
      <h2
        className="font-serif text-xl lg:text-2xl font-semibold mb-4 px-4 lg:px-8"
        data-testid={`text-row-title-${title.toLowerCase().replace(/\s/g, "-")}`}
      >
        {title}
      </h2>
      <div className="relative">
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center visibility-hidden group-hover/row:visibility-visible">
            <Button
              size="icon"
              variant="ghost"
              className="bg-black/60 text-white rounded-none h-full w-10"
              onClick={() => scroll("left")}
              data-testid={`button-scroll-left-${title}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
        )}
        <div
          ref={scrollRef}
          className="flex gap-3 px-4 lg:px-8 overflow-x-auto scrollbar-hide scroll-smooth"
          onScroll={checkScroll}
          data-testid={`row-${title.toLowerCase().replace(/\s/g, "-")}`}
        >
          {contents.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center visibility-hidden group-hover/row:visibility-visible">
            <Button
              size="icon"
              variant="ghost"
              className="bg-black/60 text-white rounded-none h-full w-10"
              onClick={() => scroll("right")}
              data-testid={`button-scroll-right-${title}`}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
