import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Eye, Ticket, TrendingUp, Users, MapPin, Clock, ArrowRight } from "lucide-react";

interface Overview {
  totalViews: number;
  ticketClicks: number;
  conversionRate: number;
  diversityTransitions: number;
  totalUsers: number;
}

interface HeatmapEntry {
  postalPrefix: string;
  views: number;
}

interface RetentionEntry {
  contentId: string;
  title: string;
  artist: string;
  totalWatchSeconds: number;
  viewCount: number;
}

interface FunnelEntry {
  contentId: string;
  title: string;
  views: number;
  ticketClicks: number;
}

function formatSeconds(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function AdminDashboard() {
  const { data: overview, isLoading: loadingOverview } = useQuery<Overview>({
    queryKey: ["/api/admin/impact/overview"],
  });

  const { data: heatmap = [], isLoading: loadingHeatmap } = useQuery<HeatmapEntry[]>({
    queryKey: ["/api/admin/impact/heatmap"],
  });

  const { data: retention = [], isLoading: loadingRetention } = useQuery<RetentionEntry[]>({
    queryKey: ["/api/admin/impact/retention"],
  });

  const { data: funnel = [], isLoading: loadingFunnel } = useQuery<FunnelEntry[]>({
    queryKey: ["/api/admin/impact/funnel"],
  });

  const maxHeatmapViews = Math.max(...heatmap.map(h => h.views), 1);

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="page-admin-dashboard">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-primary" />
          <h1 className="font-serif text-3xl lg:text-4xl font-bold" data-testid="text-dashboard-title">
            Impact & Data
          </h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Tableau de bord pour les bailleurs de fonds et administrateurs.
        </p>

        {loadingOverview ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-md" />
            ))}
          </div>
        ) : overview ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-5" data-testid="card-total-views">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Visionnements</span>
              </div>
              <p className="text-3xl font-bold">{overview.totalViews}</p>
            </Card>
            <Card className="p-5" data-testid="card-ticket-clicks">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Clics billets</span>
              </div>
              <p className="text-3xl font-bold">{overview.ticketClicks}</p>
            </Card>
            <Card className="p-5" data-testid="card-conversion-rate">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Taux de conversion</span>
              </div>
              <p className="text-3xl font-bold">{overview.conversionRate}%</p>
              <p className="text-xs text-muted-foreground">Écran vers salle</p>
            </Card>
            <Card className="p-5" data-testid="card-diversity-transitions">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Découvrabilité</span>
              </div>
              <p className="text-3xl font-bold">{overview.diversityTransitions}</p>
              <p className="text-xs text-muted-foreground">Transitions diversité</p>
            </Card>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <ArrowRight className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-lg font-bold">Tunnel de conversion</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Passage du visionnement en ligne à l'achat de billet en salle.
            </p>
            {loadingFunnel ? (
              <Skeleton className="h-48" />
            ) : funnel.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Aucune donnée disponible</p>
            ) : (
              <div className="space-y-3">
                {funnel.slice(0, 8).map((item) => {
                  const rate = item.views > 0 ? Math.round((item.ticketClicks / item.views) * 100) : 0;
                  return (
                    <div key={item.contentId} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{item.views} vues</span>
                          <ArrowRight className="w-3 h-3" />
                          <span>{item.ticketClicks} clics</span>
                        </div>
                      </div>
                      <Badge
                        variant={rate > 10 ? "default" : "secondary"}
                        className="no-default-hover-elevate no-default-active-elevate"
                        data-testid={`badge-conversion-${item.contentId}`}
                      >
                        {rate}%
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-lg font-bold">Cartographie de l'audience</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Consommation de contenu par code postal (anonymisé, préfixe FSA).
            </p>
            {loadingHeatmap ? (
              <Skeleton className="h-48" />
            ) : heatmap.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Aucune donnée disponible</p>
            ) : (
              <div className="space-y-2">
                {heatmap.sort((a, b) => b.views - a.views).map((entry) => (
                  <div key={entry.postalPrefix} className="flex items-center gap-3">
                    <span className="text-sm font-mono w-12 font-semibold" data-testid={`text-postal-${entry.postalPrefix}`}>
                      {entry.postalPrefix}
                    </span>
                    <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                      <div
                        className="h-full bg-primary/70 rounded-md transition-all duration-300"
                        style={{ width: `${(entry.views / maxHeatmapViews) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">{entry.views}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg font-bold">Rétention artistique</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Temps de visionnement par œuvre — engagement du public envers le travail des créateurs.
          </p>
          {loadingRetention ? (
            <Skeleton className="h-48" />
          ) : retention.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Aucune donnée de visionnement disponible</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Œuvre</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Artiste</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Spectateurs</th>
                    <th className="py-2 font-medium text-muted-foreground text-right">Temps total</th>
                  </tr>
                </thead>
                <tbody>
                  {retention.slice(0, 10).map((item) => (
                    <tr key={item.contentId} className="border-b last:border-0" data-testid={`row-retention-${item.contentId}`}>
                      <td className="py-2 pr-4 font-medium">{item.title}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{item.artist}</td>
                      <td className="py-2 pr-4 text-right">{item.viewCount}</td>
                      <td className="py-2 text-right font-mono">{formatSeconds(item.totalWatchSeconds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
