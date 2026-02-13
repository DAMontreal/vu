import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Heart, Eye, MapPin, Clock, QrCode, Navigation } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useState } from "react";
import type { Content, UserProfile, Venue } from "@shared/schema";

interface FeedItem {
  id: string;
  userId: string;
  activityType: string;
  contentId: string | null;
  venueId: string | null;
  description: string | null;
  createdAt: string;
  content?: Content;
  profile?: UserProfile;
}

const activityLabels: Record<string, string> = {
  watched: "a regardé",
  favorited: "a ajouté à ses favoris",
  recommended: "recommande",
  checkin: "était en salle",
};

const activityIcons: Record<string, any> = {
  watched: Eye,
  favorited: Heart,
  recommended: Heart,
  checkin: MapPin,
};

function SocialFeed() {
  const { data: feed = [], isLoading } = useQuery<FeedItem[]>({
    queryKey: ["/api/social/feed"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-md" />
        ))}
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Users className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Le Foyer est vide</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Activez le partage social dans votre profil pour contribuer au Foyer numérique.
        </p>
        <Link href="/profil">
          <Button className="mt-4" data-testid="button-go-profil">
            Configurer mon profil
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {feed.map((item) => {
        const IconComponent = activityIcons[item.activityType] || Eye;
        return (
          <Card key={item.id} className="p-4" data-testid={`feed-item-${item.id}`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconComponent className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">
                    {item.profile?.displayName || "Membre VU"}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {activityLabels[item.activityType] || item.activityType}
                  </span>
                </p>
                {item.content && (
                  <Link href={item.content.type === "book" ? `/livre/${item.content.id}` : `/spectacle/${item.content.id}`}>
                    <div className="flex items-center gap-2 mt-1 cursor-pointer">
                      <img
                        src={item.content.thumbnailUrl}
                        alt={item.content.title}
                        className="w-8 h-12 rounded-md object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{item.content.title}</p>
                        <p className="text-xs text-muted-foreground">{item.content.artist}</p>
                      </div>
                    </div>
                  </Link>
                )}
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function CheckinSection() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [checkinMethod, setCheckinMethod] = useState<"qr" | "geo">("qr");

  const { data: venuesList = [] } = useQuery<Venue[]>({
    queryKey: ["/api/venues"],
  });

  const checkinMutation = useMutation({
    mutationFn: async (data: { venueId: string; method: "qr" | "geo" }) => {
      const res = await apiRequest("POST", "/api/checkins", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Check-in réussi !",
        description: "15 Points Diversité gagnés. Continuez à fréquenter les lieux de diffusion.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/checkins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/passport"] });
      queryClient.invalidateQueries({ queryKey: ["/api/badges/me"] });
    },
    onError: () => {
      toast({
        title: "Erreur de check-in",
        description: "Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const handleGeoCheckin = () => {
    if (!selectedVenueId) {
      toast({ title: "Sélectionnez un lieu", variant: "destructive" });
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          checkinMutation.mutate({ venueId: selectedVenueId, method: "geo" });
        },
        () => {
          toast({ title: "Géolocalisation refusée", description: "Activez la géolocalisation.", variant: "destructive" });
        }
      );
    } else {
      checkinMutation.mutate({ venueId: selectedVenueId, method: "geo" });
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="p-6 text-center">
        <MapPin className="w-10 h-10 text-primary mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-3">Connectez-vous pour effectuer un check-in.</p>
        <a href="/api/login"><Button size="sm">Connexion</Button></a>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h2 className="font-serif text-lg font-bold">Check-in spectacle</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Dites « J'y étais ! » en scannant un QR code ou en utilisant votre position.
      </p>
      <div className="space-y-3">
        <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
          <SelectTrigger data-testid="select-checkin-venue">
            <SelectValue placeholder="Choisir un lieu..." />
          </SelectTrigger>
          <SelectContent>
            {venuesList.map((v) => (
              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => {
              if (!selectedVenueId) {
                toast({ title: "Sélectionnez un lieu", variant: "destructive" });
                return;
              }
              checkinMutation.mutate({ venueId: selectedVenueId, method: "qr" });
            }}
            disabled={checkinMutation.isPending}
            data-testid="button-checkin-qr"
          >
            <QrCode className="w-4 h-4" />
            Code QR
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleGeoCheckin}
            disabled={checkinMutation.isPending}
            data-testid="button-checkin-geo"
          >
            <Navigation className="w-4 h-4" />
            Géolocalisation
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function Social() {
  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="page-social">
      <div className="max-w-3xl mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="font-serif text-3xl lg:text-4xl font-bold" data-testid="text-social-title">
            Foyer Numérique
          </h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Découvrez ce que la communauté VU regarde et recommande.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SocialFeed />
          </div>
          <div className="space-y-4">
            <CheckinSection />
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Rejoindre la communauté</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Activez le partage social dans votre profil pour apparaître dans le Foyer.
              </p>
              <Link href="/profil">
                <Button variant="outline" size="sm" className="w-full" data-testid="button-manage-profile">
                  Gérer mon profil
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
