import { Play, BookOpen, Radio, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen" data-testid="page-landing">
      <div className="relative w-full h-screen overflow-hidden">
        <img
          src="/images/hero-bg.png"
          alt="VU Platform"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-3xl">
            <h1 className="font-serif text-6xl lg:text-8xl font-bold text-primary mb-4 tracking-tight">
              VU
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 font-light mb-2">
              Les arts de la scène, en un regard.
            </p>
            <p className="text-base lg:text-lg text-white/60 mb-10 max-w-xl mx-auto">
              Théâtre, danse, littérature — découvrez, regardez et vivez les spectacles qui façonnent Montréal.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap mb-16">
              <a href="/api/login">
                <Button size="lg" className="gap-2 text-base px-8" data-testid="button-landing-start">
                  <Play className="w-5 h-5" />
                  Commencer
                </Button>
              </a>
              <a href="/api/login">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8 bg-white/10 backdrop-blur-sm text-white border-white/20" data-testid="button-landing-explore">
                  Explorer
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {[
                { icon: Play, label: "Spectacles filmés" },
                { icon: BookOpen, label: "Liseuse intégrée" },
                { icon: Radio, label: "Diffusions en live" },
                { icon: Sparkles, label: "Recommandations" },
              ].map((feature) => (
                <div key={feature.label} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-white/70">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
