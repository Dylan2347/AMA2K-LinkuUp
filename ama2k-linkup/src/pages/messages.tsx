import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import {
  useListMessages,
  useSendMessage,
  getListMessagesQueryKey,
  useGetMyProfile,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useListMatches } from "@workspace/api-client-react";
import { markMatchAsRead } from "@/hooks/use-unread-counts";

export default function Messages() {
  const params = useParams<{ matchId: string }>();
  const matchId = parseInt(params.matchId || "0");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: myProfile } = useGetMyProfile();
  const myProfileId = myProfile?.id;

  const { data: matches = [] } = useListMatches();
  const match = matches.find((m) => m.id === matchId);
  const matchedProfile = match?.profile;

  const { data: messages = [], isLoading } = useListMessages(matchId, {
    query: { queryKey: getListMessagesQueryKey(matchId), enabled: !!matchId, refetchInterval: 30_000 }
  });

  const sendMessage = useSendMessage();

  useEffect(() => {
    if (matchId) markMatchAsRead(matchId);
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!content.trim() || sendMessage.isPending) return;
    const text = content.trim();
    setContent("");
    try {
      await sendMessage.mutateAsync({ matchId, data: { content: text } });
      queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(matchId) });
    } catch {
      setContent(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <Button
          data-testid="button-back"
          variant="ghost"
          size="icon"
          className="rounded-full w-9 h-9"
          onClick={() => navigate("/matches")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        {matchedProfile && (
          <div className="flex items-center gap-2.5 flex-1">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img src={matchedProfile.photoUrl} alt={matchedProfile.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{matchedProfile.name}</p>
              <div className="flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{matchedProfile.city}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
                <div className={cn("h-10 rounded-2xl bg-muted animate-pulse", i % 2 === 0 ? "w-40" : "w-52")} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-8">
            {matchedProfile && (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary shadow-md">
                <img src={matchedProfile.photoUrl} alt={matchedProfile.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">You matched with {matchedProfile?.name}!</p>
              <p className="text-muted-foreground text-xs mt-1">Say something to break the ice</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {["Hey there!", "How's your day?", "What are you up to?"].map((starter) => (
                <button
                  key={starter}
                  onClick={() => setContent(starter)}
                  className="bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderProfileId === myProfileId;
            return (
              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                  isMe
                    ? "bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-br-sm"
                    : "bg-card border border-card-border text-card-foreground rounded-bl-sm"
                )}>
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className={cn("text-[10px] mt-1", isMe ? "text-primary-foreground/60" : "text-muted-foreground")}>
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-background/80 backdrop-blur-sm flex gap-2 items-end">
        <Input
          data-testid="input-message"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${matchedProfile?.name ?? ""}...`}
          className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
        />
        <Button
          data-testid="button-send"
          size="icon"
          onClick={handleSend}
          disabled={!content.trim() || sendMessage.isPending}
          className={cn(
            "w-10 h-10 rounded-full transition-all",
            content.trim() ? "bg-primary text-primary-foreground shadow-md shadow-primary/30" : "bg-muted text-muted-foreground"
          )}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
