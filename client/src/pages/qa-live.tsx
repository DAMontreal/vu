import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Clock, ArrowLeft, Radio } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Content } from "@shared/schema";
import { io, Socket } from "socket.io-client";

interface QaSessionData {
  id: string;
  contentId: string;
  hostName: string;
  title: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  content: Content;
  messages: {
    id: string;
    sessionId: string;
    userId: string;
    userName: string;
    message: string;
    isHost: boolean;
    createdAt: string;
  }[];
}

function QaSessionList() {
  const { data: sessions = [], isLoading } = useQuery<(QaSessionData & { content: Content })[]>({
    queryKey: ["/api/qa-sessions"],
  });

  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="page-qa-list">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <MessageCircle className="w-8 h-8 text-primary" />
          <h1 className="font-serif text-3xl lg:text-4xl font-bold" data-testid="text-qa-title">
            Q&A en direct
          </h1>
        </div>
        <p className="text-muted-foreground mb-8 max-w-xl">
          Après chaque diffusion, les artistes répondent à vos questions en direct pendant 15 minutes.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-md" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucune session Q&A prévue</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Revenez bientôt pour participer aux prochaines sessions de questions-réponses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <Link key={session.id} href={`/qa/${session.id}`}>
                <Card className="overflow-visible hover-elevate cursor-pointer" data-testid={`card-qa-session-${session.id}`}>
                  <div className="flex gap-3 p-4">
                    <img
                      src={session.content?.thumbnailUrl}
                      alt={session.content?.title}
                      className="w-16 h-24 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Badge className="mb-2 no-default-hover-elevate no-default-active-elevate">
                        <Radio className="w-3 h-3 mr-1" />
                        En direct
                      </Badge>
                      <h3 className="font-serif font-bold text-sm leading-tight mb-1">
                        {session.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-1">{session.content?.title}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(session.startsAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        {" — "}
                        {new Date(session.endsAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QaRoom({ id }: { id: string }) {
  const { user } = useAuth();
  const { data: session, isLoading } = useQuery<QaSessionData>({
    queryKey: ["/api/qa-sessions", id],
  });
  const [messages, setMessages] = useState<QaSessionData["messages"]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session) {
      setMessages(session.messages || []);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const socket = io({ path: "/socket.io" });
    socketRef.current = socket;
    socket.emit("join-qa", session.id);

    socket.on("new-qa-message", (msg: any) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => { socket.disconnect(); };
  }, [session?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !session || !user) return;
    socketRef.current?.emit("qa-message", {
      sessionId: session.id,
      userId: user.id,
      userName: user.firstName || user.email || "Spectateur",
      message: newMessage.trim(),
      isHost: false,
    });
    setNewMessage("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Session introuvable</h2>
          <Link href="/qa">
            <Button><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-4" data-testid="page-qa-room">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Link href="/qa">
            <Button size="icon" variant="ghost">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-xl font-bold" data-testid="text-qa-session-title">{session.title}</h1>
            <p className="text-sm text-muted-foreground">{session.content?.title}</p>
          </div>
          <Badge className="ml-auto no-default-hover-elevate no-default-active-elevate">
            <Radio className="w-3 h-3 mr-1" />
            En direct
          </Badge>
        </div>

        <Card className="flex flex-col h-[calc(100vh-12rem)]">
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <img
                src={session.content?.thumbnailUrl}
                alt={session.content?.title}
                className="w-12 h-16 object-cover rounded-md"
              />
              <div>
                <p className="font-semibold text-sm">Avec {session.hostName}</p>
                <p className="text-xs text-muted-foreground">
                  Posez vos questions dans le chat ci-dessous
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.isHost ? "items-end" : ""}`}>
                <div className={`max-w-[80%] ${msg.isHost ? "bg-primary/10 border border-primary/20" : "bg-muted"} rounded-md px-3 py-2`}>
                  <span className={`text-xs font-semibold ${msg.isHost ? "text-primary" : "text-foreground"}`}>
                    {msg.userName} {msg.isHost && "(Artiste)"}
                  </span>
                  <p className="text-sm mt-0.5">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Posez votre question..."
              className="flex-1"
              data-testid="input-qa-message"
            />
            <Button size="icon" onClick={sendMessage} data-testid="button-send-qa">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function QaLivePage() {
  const [matchList] = useRoute("/qa");
  const [matchRoom, params] = useRoute("/qa/:id");

  if (matchRoom && params?.id) {
    return <QaRoom id={params.id} />;
  }

  return <QaSessionList />;
}
