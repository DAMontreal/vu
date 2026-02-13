import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { User, Shield, Download, Trash2, Award, Eye, BookOpen, Heart, Compass, Film, MapPin, Music } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { UserProfile, BadgeDef, UserBadge } from "@shared/schema";
import type { LucideIcon } from "lucide-react";

const badgeIcons: Record<string, LucideIcon> = {
  Compass, Film, Eye, Award, MapPin, Music,
};

export default function Profil() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: profile, isLoading: loadingProfile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
  });

  const { data: allBadges = [] } = useQuery<BadgeDef[]>({
    queryKey: ["/api/badges"],
    enabled: isAuthenticated,
  });

  const { data: myBadges = [] } = useQuery<(UserBadge & { badge: BadgeDef })[]>({
    queryKey: ["/api/badges/me"],
    enabled: isAuthenticated,
  });

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isCuratorOptIn, setIsCuratorOptIn] = useState(false);
  const [isSocialOptIn, setIsSocialOptIn] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showWatchHistory, setShowWatchHistory] = useState(false);
  const [showReadings, setShowReadings] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setBio(profile.bio || "");
      setIsCuratorOptIn(profile.isCuratorOptIn || false);
      setIsSocialOptIn(profile.isSocialOptIn || false);
      setShowFavorites(profile.showFavorites || false);
      setShowWatchHistory(profile.showWatchHistory || false);
      setShowReadings(profile.showReadings || false);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const res = await apiRequest("PUT", "/api/profile", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Profil mis à jour" });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("GET", "/api/privacy/export");
      return res.json();
    },
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vu-mes-donnees.json";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Données exportées" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/privacy/data");
    },
    onSuccess: () => {
      toast({ title: "Données supprimées", description: "Toutes vos données personnelles ont été effacées." });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
  });

  const saveProfile = () => {
    updateMutation.mutate({
      displayName,
      bio,
      isCuratorOptIn,
      isSocialOptIn,
      showFavorites,
      showWatchHistory,
      showReadings,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <User className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold mb-3">Mon Profil</h1>
          <p className="text-muted-foreground mb-6">Connectez-vous pour gérer votre profil.</p>
          <a href="/api/login">
            <Button data-testid="button-login-profile">Connexion</Button>
          </a>
        </div>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <Skeleton className="h-40 w-full rounded-md mb-6" />
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
      </div>
    );
  }

  const earnedBadgeIds = new Set(myBadges.map(b => b.badgeId));

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="page-profil">
      <div className="max-w-3xl mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <User className="w-8 h-8 text-primary" />
          <h1 className="font-serif text-3xl lg:text-4xl font-bold" data-testid="text-profil-title">
            Mon Profil
          </h1>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="font-serif text-lg font-bold mb-4">Informations publiques</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nom d'affichage</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={user?.firstName || "Votre nom"}
                data-testid="input-display-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bio</label>
              <Input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Passionné de théâtre et de danse..."
                data-testid="input-bio"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg font-bold">Confidentialité (Loi 25)</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Vous avez un contrôle total sur vos données. Le partage est une démarche volontaire (opt-in).
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Profil curateur</p>
                <p className="text-xs text-muted-foreground">Afficher vos coups de cœur publiquement</p>
              </div>
              <Switch
                checked={isCuratorOptIn}
                onCheckedChange={setIsCuratorOptIn}
                data-testid="switch-curator-opt-in"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Activité sociale</p>
                <p className="text-xs text-muted-foreground">Vos activités apparaissent dans le Foyer numérique</p>
              </div>
              <Switch
                checked={isSocialOptIn}
                onCheckedChange={setIsSocialOptIn}
                data-testid="switch-social-opt-in"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm">Afficher mes favoris</p>
              </div>
              <Switch
                checked={showFavorites}
                onCheckedChange={setShowFavorites}
                data-testid="switch-show-favorites"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm">Afficher mon historique</p>
              </div>
              <Switch
                checked={showWatchHistory}
                onCheckedChange={setShowWatchHistory}
                data-testid="switch-show-history"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm">Afficher mes lectures</p>
              </div>
              <Switch
                checked={showReadings}
                onCheckedChange={setShowReadings}
                data-testid="switch-show-readings"
              />
            </div>
          </div>
          <Button
            className="mt-6 w-full"
            onClick={saveProfile}
            disabled={updateMutation.isPending}
            data-testid="button-save-profile"
          >
            {updateMutation.isPending ? "Enregistrement..." : "Enregistrer les préférences"}
          </Button>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg font-bold">Mes Badges</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {allBadges.map((badge) => {
              const earned = earnedBadgeIds.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-md border text-center ${earned ? "bg-primary/10 border-primary/30" : "opacity-40"}`}
                  data-testid={`badge-${badge.code}`}
                >
                  {(() => { const Icon = badgeIcons[badge.icon] || Award; return <Icon className="w-7 h-7 mx-auto mb-1 text-primary" />; })()}
                  <p className="text-sm font-semibold">{badge.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                  {earned && (
                    <Badge variant="default" className="mt-2 no-default-hover-elevate no-default-active-elevate">
                      Obtenu
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-serif text-lg font-bold mb-4">Gestion des données</h2>
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              data-testid="button-export-data"
            >
              <Download className="w-4 h-4 mr-2" />
              {exportMutation.isPending ? "Export..." : "Exporter mes données"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (window.confirm("Êtes-vous sûr de vouloir supprimer toutes vos données ? Cette action est irréversible.")) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              data-testid="button-delete-data"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteMutation.isPending ? "Suppression..." : "Supprimer mes données"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
