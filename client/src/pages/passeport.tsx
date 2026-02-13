import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Ticket, Gift, Star, Trophy, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Content } from "@shared/schema";

interface PassportData {
  totalPoints: number;
  history: {
    id: string;
    userId: string;
    contentId: string;
    points: number;
    createdAt: string;
    content: Content;
  }[];
  rewards: {
    id: string;
    userId: string;
    code: string;
    description: string;
    pointsCost: number;
    redeemed: boolean;
    createdAt: string;
  }[];
}

const rewardOptions = [
  { description: "10% de réduction sur un billet en salle", cost: 50, icon: Ticket },
  { description: "Billet gratuit pour un spectacle", cost: 100, icon: Gift },
  { description: "Rencontre VIP avec l'artiste", cost: 200, icon: Star },
];

export default function Passeport() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: passport, isLoading } = useQuery<PassportData>({
    queryKey: ["/api/passport"],
    enabled: isAuthenticated,
  });

  const redeemMutation = useMutation({
    mutationFn: async (data: { description: string; pointsCost: number }) => {
      const res = await apiRequest("POST", "/api/passport/redeem", data);
      return res.json();
    },
    onSuccess: (reward: any) => {
      toast({
        title: "Récompense débloquée !",
        description: `Votre code promo : ${reward.code}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/passport"] });
    },
    onError: () => {
      toast({
        title: "Points insuffisants",
        description: "Continuez à regarder des spectacles pour gagner des points.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <Award className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold mb-3">Passeport Culturel</h1>
          <p className="text-muted-foreground mb-6">
            Connectez-vous pour accéder à votre passeport culturel et gagner des récompenses.
          </p>
          <a href="/api/login">
            <Button data-testid="button-login-passport">Connexion</Button>
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-40 w-full rounded-md mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalPoints = passport?.totalPoints || 0;
  const progress100 = Math.min((totalPoints / 100) * 100, 100);

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="page-passeport">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Award className="w-8 h-8 text-primary" />
          <h1 className="font-serif text-3xl lg:text-4xl font-bold" data-testid="text-passeport-title">
            Passeport Culturel
          </h1>
        </div>

        <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vos Points Diversité</p>
                <p className="text-4xl font-bold text-primary" data-testid="text-total-points">{totalPoints}</p>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Prochain palier : 100 pts</span>
                <span>{totalPoints}/100</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress100}%` }}
                  data-testid="progress-bar"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                Chaque vidéo vue = 10 Points Diversité
              </p>
            </div>
          </div>
        </Card>

        <h2 className="font-serif text-xl font-bold mb-4">Récompenses disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {rewardOptions.map((option) => {
            const canRedeem = totalPoints >= option.cost;
            return (
              <Card key={option.cost} className="p-5 flex flex-col items-center text-center">
                <option.icon className={`w-10 h-10 mb-3 ${canRedeem ? "text-primary" : "text-muted-foreground"}`} />
                <p className="font-semibold text-sm mb-1">{option.description}</p>
                <Badge
                  variant={canRedeem ? "default" : "secondary"}
                  className="mb-3 no-default-hover-elevate no-default-active-elevate"
                >
                  {option.cost} pts
                </Badge>
                <Button
                  size="sm"
                  disabled={!canRedeem || redeemMutation.isPending}
                  onClick={() => redeemMutation.mutate({ description: option.description, pointsCost: option.cost })}
                  data-testid={`button-redeem-${option.cost}`}
                >
                  {canRedeem ? "Échanger" : "Points insuffisants"}
                </Button>
              </Card>
            );
          })}
        </div>

        {passport?.rewards && passport.rewards.length > 0 && (
          <>
            <h2 className="font-serif text-xl font-bold mb-4">Mes récompenses</h2>
            <div className="space-y-3 mb-10">
              {passport.rewards.map((reward) => (
                <Card key={reward.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-sm">{reward.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(reward.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <Badge variant="outline" className="font-mono no-default-hover-elevate no-default-active-elevate" data-testid={`text-reward-code-${reward.id}`}>
                    {reward.code}
                  </Badge>
                </Card>
              ))}
            </div>
          </>
        )}

        {passport?.history && passport.history.length > 0 && (
          <>
            <h2 className="font-serif text-xl font-bold mb-4">Historique des points</h2>
            <div className="space-y-2">
              {passport.history.slice(0, 10).map((evt) => (
                <div key={evt.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={evt.content?.thumbnailUrl}
                      alt={evt.content?.title}
                      className="w-8 h-12 object-cover rounded-md"
                    />
                    <div>
                      <p className="text-sm font-medium">{evt.content?.title}</p>
                      <p className="text-xs text-muted-foreground">{evt.content?.artist}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate">
                    +{evt.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
