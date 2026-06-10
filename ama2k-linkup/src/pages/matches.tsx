import { useState } from "react";
import {
  useListMatches,
  useListLikesReceived,
  useRecordSwipe,
  getListMatchesQueryKey,
  getListLikesReceivedQueryKey,
} from "@workspace/api-client-react";
import type { Profile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Heart, MessageCircle, Clock, X, Eye, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

function LikedYouCard({ profile, onAction }: { profile: Profile; onAction: () => void }) {
  const [open, setOpen] = useState(false);
  const [actioned, setActioned] = useState(false);
  const recordSwipe = useRecordSwipe();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSwipe = async (direction: "like" | "pass") => {
    try {
      const result = await recordSwipe.mutateAsync({
        data: { targetProfileId: profile.id, direction },
      });
      setActioned(true);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: getListLikesReceivedQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListMatchesQueryKey() });

      if (direction === "like" && result.matched) {
        toast({
          title: "It's a match! 🎉",
          description: `You and ${profile.name} liked each other!`,
          duration: 6000,
        });
      }
    } catch {
      // ignore
    }
  };

  if (actioned) return null;

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-1.5 shrink-0 group">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary shadow-md shadow-primary/20">
            <img
              src={profile.photoUrl}
              alt="Someone liked you"
              className="w-full h-full object-cover blur-[6px] scale-110 group-hover:blur-[4px] transition-all duration-200"
            />
          </div>
          {/* Lock overlay */}
          <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/20">
            <EyeOff className="w-4 h-4 text-white drop-shadow" />
          </div>
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30 pointer-events-none" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{profile.city.split(",")[0]}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden rounded-3xl border-0">
          {/* Blurred hero photo */}
          <div className="relative h-80 w-full overflow-hidden">
            <img
              src={profile.photoUrl}
              alt="Someone liked you"
              className="w-full h-full object-cover blur-xl scale-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Mystery label */}
            <div className="absolute top-4 left-0 right-0 flex justify-center">
              <div className="bg-primary/90 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <Eye className="w-3 h-3" />
                Someone likes you!
              </div>
            </div>

            {/* Profile hint */}
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-white font-bold text-2xl">???, {profile.age}</p>
              <p className="text-white/70 text-sm mt-0.5">{profile.city}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-5 bg-background">
            <p className="text-center text-sm text-muted-foreground mb-5">
              Like them back to reveal who it is and start chatting!
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                size="icon"
                className="w-14 h-14 rounded-full border-2 border-muted-foreground/30 hover:border-destructive hover:text-destructive"
                onClick={() => handleSwipe("pass")}
                disabled={recordSwipe.isPending}
              >
                <X className="w-6 h-6" />
              </Button>
              <Button
                size="icon"
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                onClick={() => handleSwipe("like")}
                disabled={recordSwipe.isPending}
              >
                <Heart className="w-7 h-7" fill="white" strokeWidth={0} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Matches() {
  const { data: matches = [], isLoading: matchesLoading } = useListMatches();
  const { data: liked = [], isLoading: likedLoading } = useListLikesReceived();

  const isLoading = matchesLoading || likedLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-5">
        <div className="h-8 w-40 bg-muted rounded-lg animate-pulse" />
        <div className="flex gap-3 overflow-x-hidden pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-16 h-16 rounded-full bg-muted animate-pulse shrink-0" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 items-center">
            <div className="w-14 h-14 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 gap-2 flex flex-col">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const hasAnything = matches.length > 0 || liked.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" fill="currentColor" strokeWidth={0} />
          <h1 className="text-xl font-bold text-foreground">Matches</h1>
          {matches.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {matches.length}
            </span>
          )}
        </div>
      </div>

      {!hasAnything ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg text-foreground mb-1">No matches yet</h3>
            <p className="text-muted-foreground text-sm">Start swiping to find your connections in Zimbabwe!</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">

          {/* ── Liked You ───────────────────────────────── */}
          {liked.length > 0 && (
            <div className="px-5 pt-4 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Liked You</p>
                <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {liked.length}
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
                {liked.map((profile) => (
                  <LikedYouCard key={profile.id} profile={profile} onAction={() => {}} />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Like them back to reveal who they are
              </p>
            </div>
          )}

          {/* ── New Matches Row ──────────────────────────── */}
          {matches.filter((m) => !m.lastMessage).length > 0 && (
            <div className="px-5 pt-4 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">New Matches</p>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {matches.filter((m) => !m.lastMessage).map((match) => (
                  <Link key={match.id} href={`/messages/${match.id}`} className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary shadow-md shadow-primary/20">
                        {match.profile?.photoUrl ? (
                          <img src={match.profile.photoUrl} alt={match.profile?.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                            {match.profile?.name?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    <span className="text-xs font-medium text-foreground max-w-[64px] truncate">{match.profile?.name?.split(" ")[0]}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Messages ─────────────────────────────────── */}
          {matches.filter((m) => !!m.lastMessage).length > 0 && (
            <div className="px-5 pt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Messages</p>
              <div className="flex flex-col divide-y divide-border">
                {matches.filter((m) => !!m.lastMessage).map((match) => (
                  <Link key={match.id} href={`/messages/${match.id}`}>
                    <div
                      data-testid={`card-match-${match.id}`}
                      className="flex items-center gap-3 py-3 hover:bg-muted/50 rounded-xl px-2 -mx-2 transition-colors"
                    >
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden">
                          {match.profile?.photoUrl ? (
                            <img src={match.profile.photoUrl} alt={match.profile?.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                              {match.profile?.name?.[0]}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-foreground text-sm">{match.profile?.name}</span>
                          {match.lastMessageAt && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {formatDistanceToNow(new Date(match.lastMessageAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs truncate">{match.lastMessage}</p>
                      </div>
                      <MessageCircle className="w-4 h-4 text-primary shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Nudge when only new matches exist */}
          {matches.filter((m) => !m.lastMessage).length === matches.length && matches.length > 0 && liked.length === 0 && (
            <div className="px-5 pt-4">
              <p className="text-xs text-muted-foreground text-center">Tap a profile above to start a conversation</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
