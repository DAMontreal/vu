import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { MapPin, Play, Ticket, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useState } from "react";
import "leaflet/dist/leaflet.css";

interface EventWithDetails {
  id: string;
  contentId: string;
  venueId: string;
  startTime: string;
  endTime: string;
  isTonight: boolean;
  content: {
    id: string;
    title: string;
    artist: string;
    thumbnailUrl: string;
    ticketUrl: string;
    duration: number;
    category: string;
    type: string;
  };
  venue: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
}

const categoryColors: Record<string, string> = {
  theatre_contemporain: "#f97316",
  danse_montreal: "#ec4899",
  concerts: "#a855f7",
  coup_de_coeur_diversite: "#14b8a6",
  spectacles_live: "#ef4444",
  litterature_essais: "#3b82f6",
};

const categoryLabels: Record<string, string> = {
  theatre_contemporain: "Théâtre",
  danse_montreal: "Danse",
  concerts: "Concert",
  coup_de_coeur_diversite: "Diversité",
  spectacles_live: "Live",
  litterature_essais: "Littérature",
};

export default function CarteMontreal() {
  const { data: events = [], isLoading } = useQuery<EventWithDetails[]>({
    queryKey: ["/api/events"],
  });

  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null);

  const montrealCenter: [number, number] = [45.5152, -73.5672];

  return (
    <div className="min-h-screen pt-16" data-testid="page-carte">
      <div className="relative h-[calc(100vh-4rem)]">
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
          <div className="bg-background/90 backdrop-blur-md rounded-md p-3 border">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h1 className="font-serif text-lg font-bold" data-testid="text-carte-title">Montréal ce soir</h1>
            </div>
            <p className="text-xs text-muted-foreground">
              {events.length} spectacle{events.length !== 1 ? "s" : ""} en salle
            </p>
          </div>
          <div className="bg-background/90 backdrop-blur-md rounded-md p-2 border">
            <div className="flex flex-col gap-1">
              {Object.entries(categoryColors).map(([key, color]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-muted-foreground">{categoryLabels[key]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <MapContainer
            center={montrealCenter}
            zoom={13}
            className="w-full h-full"
            style={{ background: "#1a1a2e" }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {events.map((event) => (
              <CircleMarker
                key={event.id}
                center={[event.venue.lat, event.venue.lng]}
                radius={12}
                pathOptions={{
                  color: categoryColors[event.content.category] || "#f97316",
                  fillColor: categoryColors[event.content.category] || "#f97316",
                  fillOpacity: 0.8,
                  weight: 2,
                  opacity: 1,
                }}
                eventHandlers={{
                  click: () => setSelectedEvent(event),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <p className="font-bold text-sm">{event.content.title}</p>
                    <p className="text-xs text-gray-500">{event.venue.name}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}

        {selectedEvent && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] max-w-lg mx-auto" data-testid="event-detail-panel">
            <div className="bg-background/95 backdrop-blur-md border rounded-md overflow-hidden">
              <div className="flex gap-3 p-4">
                <img
                  src={selectedEvent.content.thumbnailUrl}
                  alt={selectedEvent.content.title}
                  className="w-20 h-28 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <Badge
                        style={{
                          backgroundColor: categoryColors[selectedEvent.content.category],
                          color: "white",
                        }}
                        className="mb-1 no-default-hover-elevate no-default-active-elevate"
                      >
                        {categoryLabels[selectedEvent.content.category]}
                      </Badge>
                      <h3 className="font-serif font-bold text-base leading-tight" data-testid="text-event-title">
                        {selectedEvent.content.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{selectedEvent.content.artist}</p>
                    </div>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="text-muted-foreground text-lg leading-none"
                      data-testid="button-close-event"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedEvent.venue.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedEvent.content.duration} min
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Link href={`/spectacle/${selectedEvent.content.id}`}>
                      <Button size="sm" variant="ghost" data-testid="button-watch-trailer">
                        <Play className="w-3 h-3 mr-1" />
                        Bande-annonce
                      </Button>
                    </Link>
                    {selectedEvent.content.ticketUrl && (
                      <a href={selectedEvent.content.ticketUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" data-testid="button-buy-ticket-map">
                          <Ticket className="w-3 h-3 mr-1" />
                          Acheter
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
