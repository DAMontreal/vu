import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/navbar";
import Home from "@/pages/home";
import SpectacleDetail from "@/pages/spectacle-detail";
import LivreDetail from "@/pages/livre-detail";
import MaListe from "@/pages/ma-liste";
import Livres from "@/pages/livres";
import Live from "@/pages/live";
import Concerts from "@/pages/concerts";
import CarteMontreal from "@/pages/carte-montreal";
import CarteBlanche from "@/pages/carte-blanche";
import WatchPartyPage from "@/pages/watch-party";
import QaLivePage from "@/pages/qa-live";
import Passeport from "@/pages/passeport";
import Recherche from "@/pages/recherche";
import Landing from "@/pages/landing";
import AdminDashboard from "@/pages/admin-dashboard";
import Profil from "@/pages/profil";
import Social from "@/pages/social";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function AppContent() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold text-primary mb-2">VU</h1>
          <p className="text-muted-foreground text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Switch>
        <Route path="/" component={user ? Home : Landing} />
        <Route path="/spectacle/:id" component={SpectacleDetail} />
        <Route path="/livre/:id" component={LivreDetail} />
        <Route path="/ma-liste" component={MaListe} />
        <Route path="/livres" component={Livres} />
        <Route path="/live" component={Live} />
        <Route path="/concerts" component={Concerts} />
        <Route path="/carte" component={CarteMontreal} />
        <Route path="/carte-blanche" component={CarteBlanche} />
        <Route path="/watch-party" component={WatchPartyPage} />
        <Route path="/watch-party/:code" component={WatchPartyPage} />
        <Route path="/qa" component={QaLivePage} />
        <Route path="/qa/:id" component={QaLivePage} />
        <Route path="/passeport" component={Passeport} />
        <Route path="/recherche" component={Recherche} />
        <Route path="/social" component={Social} />
        <Route path="/profil" component={Profil} />
        <Route path="/admin/impact" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
