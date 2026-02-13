import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Send, Copy, Play, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Content } from "@shared/schema";
import { io, Socket } from "socket.io-client";

interface PartyData {
  id: string;
  contentId: string;
  hostUserId: string;
  title: string;
  code: string;
  isActive: boolean;
  content: Content;
  messages: {
    id: string;
    partyId: string;
    userId: string;
    userName: string;
    message: string;
    createdAt: string;
  }[];
}

function CreatePartyForm() {
  const { data: contents = [] } = useQuery<Content[]>({ queryKey: ["/api/contents"] });
  const [title, setTitle] = useState("");
  const [contentId, setContentId] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const createMutation = useMutation({
    mutationFn: async (data: { contentId: string; title: string }) => {
      const res = await apiRequest("POST", "/api/watch-parties", data);
      return res.json();
    },
    onSuccess: (party: any) => {
      setLocation(`/watch-party/${party.code}`);
    },
  });

  const videoContents = contents.filter(c => c.type === "video");

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="page-create-party">
      <div className="max-w-xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="font-serif text-3xl font-bold" data-testid="text-watch-party-heading">Watch Party</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Regardez un spectacle ensemble \u00e0 distance avec vos amis. Cr\u00e9ez une salle et partagez le code.
        </p>

        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nom de la salle</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Soir\u00e9e th\u00e9\u00e2tre entre amis"
                data-testid="input-party-title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Choisir un spectacle</label>
              <Select value={contentId} onValueChange={setContentId}>
                <SelectTrigger data-testid="select-party-content">
                  <SelectValue placeholder="S\u00e9lectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {videoContents.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title} \u2014 {c.artist}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => createMutation.mutate({ contentId, title })}
              disabled={!title || !contentId || createMutation.isPending}
              data-testid="button-create-party"
            >
              <Users className="w-4 h-4 mr-2" />
              {createMutation.isPending ? "Cr\u00e9ation..." : "Cr\u00e9er la salle"}
            </Button>
          </div>
        </Card>

        <div className="mt-8">
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Rejoindre une salle</h3>
            <JoinPartyForm />
          </Card>
        </div>
      </div>
    </div>
  );
}

function JoinPartyForm() {
  const [code, setCode] = useState("");

  return (
    <div className="flex gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Code de la salle"
        className="flex-1 uppercase"
        data-testid="input-party-code"
      />
      <Link href={`/watch-party/${code}`}>
        <Button disabled={!code} data-testid="button-join-party">
          Rejoindre
        </Button>
      </Link>
    </div>
  );
}

function PartyRoom({ code }: { code: string }) {
  const { user } = useAuth();
  const { data: party, isLoading } = useQuery<PartyData>({
    queryKey: ["/api/watch-parties", code],
  });
  const [messages, setMessages] = useState<PartyData["messages"]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (party) {
      setMessages(party.messages || []);
    }
  }, [party]);

  useEffect(() => {
    if (!party) return;
    const socket = io({ path: "/socket.io" });
    socketRef.current = socket;
    socket.emit("join-party", party.id);

    socket.on("new-party-message", (msg: any) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on("party-sync", (data: any) => {
      toast({
        title: data.action === "play" ? "Lecture" : "Pause",
        description: "L'h\u00f4te a synchronis\u00e9 la lecture.",
      });
    });

    return () => { socket.disconnect(); };
  }, [party?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !party || !user) return;
    socketRef.current?.emit("party-message", {
      partyId: party.id,
      userId: user.id,
      userName: user.firstName || user.email || "Anonyme",
      message: newMessage.trim(),
    });
    setNewMessage("");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copi\u00e9 !", description: `Partagez le code ${code} avec vos amis.` });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="aspect-video w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Salle introuvable</h2>
          <p className="text-muted-foreground mb-4">Ce code ne correspond \u00e0 aucune salle active.</p>
          <Link href="/watch-party">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-4" data-testid="page-party-room">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/watch-party">
              <Button size="icon" variant="ghost">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="font-serif text-xl font-bold" data-testid="text-party-title">{party.title}</h1>
            <Badge className="no-default-hover-elevate cursor-pointer" onClick={copyCode} data-testid="badge-party-code">
              <Copy className="w-3 h-3 mr-1" />
              {code}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-10rem)]">
          <div className="flex-1 min-w-0">
            <div className="relative aspect-video bg-black rounded-md overflow-hidden">
              {party.content?.videoUrl ? (
                <iframe
                  src={party.content.videoUrl.replace("watch?v=", "embed/") + "?autoplay=0"}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Play className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="mt-3">
              <h2 className="font-serif text-lg font-bold">{party.content?.title}</h2>
              <p className="text-sm text-muted-foreground">{party.content?.artist}</p>
            </div>
          </div>

          <div className="w-full lg:w-80 flex flex-col border rounded-md overflow-hidden bg-card">
            <div className="p-3 border-b bg-muted/30">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Chat de la salle
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                  <span className="text-xs font-semibold text-primary">{msg.userName}</span>
                  <span className="text-sm">{msg.message}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Votre message..."
                className="flex-1"
                data-testid="input-party-message"
              />
              <Button size="icon" onClick={sendMessage} data-testid="button-send-message">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WatchPartyPage() {
  const [match, params] = useRoute("/watch-party/:code");

  if (match && params?.code) {
    return <PartyRoom code={params.code} />;
  }

  return <CreatePartyForm />;
}
