import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetDiscoverFeed,
  useGetDiscoverStats,
  useRecordSwipe,
  getGetDiscoverFeedQueryKey,
  getListMatchesQueryKey,
} from "@workspace/api-client-react";
import { X, Heart, Star, Flame, MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Profile {
  id: number;
  name: string;
  age: number;
  city: string;
  bio: string;
  photoUrl: string;
  interests?: string[];
  lookingFor: string;
}

interface Match {
  id: number;
  profile?: Profile;
}

export default function Discover() {
  const queryClient = useQueryClient();
  const { data: feed = [], isLoading } = useGetDiscoverFeed({ limit: 20 }, {
    query: { queryKey: getGetDiscoverFeedQueryKey({ limit: 20 }) }
  });
  const { data: stats } = useGetDiscoverStats();
  const recordSwipe = useRecordSwipe();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchModal, setMatchModal] = useState<{ profile: Profile; match: Match } | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const dragStartRef = useRef<number>(0);

  const currentProfile = feed[currentIndex] as Profile | undefined;
  const nextProfile = feed[currentIndex + 1] as Profile | undefined;

  const handleSwipe = async (direction: "like" | "pass") => {
    if (!currentProfile || recordSwipe.isPending) return;
    setSwipeDirection(direction === "like" ? "right" : "left");
    setTimeout(() => {
      setSwipeDirection(null);
      setDragX(0);
    }, 300);

    try {
      const result = await recordSwipe.mutateAsync({ data: { targetProfileId: currentProfile.id, direction } });
      if (result.matched && result.match) {
        setMatchModal({ profile: currentProfile, match: result.match as Match });
        queryClient.invalidateQueries({ queryKey: getListMatchesQueryKey() });
      }
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        queryClient.invalidateQueries({ queryKey: getGetDiscoverFeedQueryKey({ limit: 20 }) });
      }, 250);
    } catch {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragX(e.clientX - dragStartRef.current);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX > 80) handleSwipe("like");
    else if (dragX < -80) handleSwipe("pass");
    else setDragX(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setDragX(e.touches[0].clientX - dragStartRef.current);
  };

  const handleTouchEnd = () => {
    if (dragX > 80) handleSwipe("like");
    else if (dragX < -80) handleSwipe("pass");
    else setDragX(0);
  };

  const rotation = dragX * 0.08;
  const likeOpacity = Math.min(Math.max(dragX / 100, 0), 1);
  const passOpacity = Math.min(Math.max(-dragX / 100, 0), 1);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse flex items-center justify-center">
          <Flame className="w-8 h-8 text-primary animate-bounce" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">Finding your people...</p>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Flame className="w-12 h-12 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">You've seen everyone!</h2>
          <p className="text-muted-foreground text-sm">Check back soon for more profiles in Zimbabwe.</p>
        </div>
        <Button onClick={() => { setCurrentIndex(0); queryClient.invalidateQueries({ queryKey: getGetDiscoverFeedQueryKey({ limit: 20 }) }); }} className="bg-primary text-primary-foreground rounded-full px-8">
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header Stats */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground">LinkUp</span>
        </div>
        <div className="flex gap-3">
          {stats && (
            <>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="w-3 h-3 text-secondary" />
                <span>{stats.profilesNearby} nearby</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Heart className="w-3 h-3 text-accent" />
                <span>{stats.likesReceived} likes</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative px-4 pb-2 overflow-hidden">
        {/* Next card (behind) */}
        {nextProfile && (
          <div className="absolute inset-x-4 inset-y-0 rounded-3xl overflow-hidden shadow-xl scale-95 opacity-70 z-0" data-testid="card-next">
            <img src={nextProfile.photoUrl} alt={nextProfile.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        )}

        {/* Current card */}
        {currentProfile && (
          <div
            data-testid={`card-profile-${currentProfile.id}`}
            className="absolute inset-x-4 inset-y-0 rounded-3xl overflow-hidden shadow-2xl z-10 cursor-grab active:cursor-grabbing"
            style={{
              transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
              transition: isDragging ? "none" : swipeDirection ? "transform 0.3s ease-out, opacity 0.3s" : "transform 0.2s ease-out",
              opacity: swipeDirection ? 0 : 1,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img src={currentProfile.photoUrl} alt={currentProfile.name} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

            {/* Like overlay */}
            <div className="absolute top-8 left-6 rotate-[-20deg] border-4 border-green-400 rounded-lg px-4 py-2 pointer-events-none" style={{ opacity: likeOpacity }}>
              <span className="text-green-400 text-2xl font-black tracking-widest">LIKE</span>
            </div>

            {/* Pass overlay */}
            <div className="absolute top-8 right-6 rotate-[20deg] border-4 border-red-400 rounded-lg px-4 py-2 pointer-events-none" style={{ opacity: passOpacity }}>
              <span className="text-red-400 text-2xl font-black tracking-widest">NOPE</span>
            </div>

            {/* Profile info */}
            <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <h2 className="text-white text-2xl font-bold">{currentProfile.name}, {currentProfile.age}</h2>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-white/70" />
                    <span className="text-white/70 text-sm">{currentProfile.city}</span>
                  </div>
                </div>
                <Badge className="bg-primary/80 text-white border-0 text-xs capitalize">
                  {currentProfile.lookingFor}
                </Badge>
              </div>
              <p className="text-white/80 text-sm leading-relaxed line-clamp-2">{currentProfile.bio}</p>
              {currentProfile.interests && currentProfile.interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {currentProfile.interests.slice(0, 3).map((interest) => (
                    <span key={interest} className="bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-5 pb-6 pt-2 px-8">
        <Button
          data-testid="button-pass"
          variant="outline"
          size="icon"
          className="w-14 h-14 rounded-full border-2 border-red-400/50 text-red-400 hover:bg-red-400/10 hover:border-red-400 shadow-lg transition-all"
          onClick={() => handleSwipe("pass")}
          disabled={recordSwipe.isPending}
        >
          <X className="w-7 h-7" strokeWidth={2.5} />
        </Button>

        <Button
          data-testid="button-superlike"
          variant="outline"
          size="icon"
          className="w-11 h-11 rounded-full border-2 border-secondary/50 text-secondary hover:bg-secondary/10 hover:border-secondary shadow-md transition-all"
        >
          <Star className="w-5 h-5" />
        </Button>

        <Button
          data-testid="button-like"
          size="icon"
          className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105"
          onClick={() => handleSwipe("like")}
          disabled={recordSwipe.isPending}
        >
          <Heart className="w-7 h-7" fill="currentColor" strokeWidth={0} />
        </Button>
      </div>

      {/* Match Modal */}
      <Dialog open={!!matchModal} onOpenChange={() => setMatchModal(null)}>
        <DialogContent className="max-w-sm mx-auto rounded-3xl border-0 bg-gradient-to-b from-primary to-accent text-white shadow-2xl p-0 overflow-hidden">
          <div className="relative px-6 pt-8 pb-6 text-center">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <div className="text-5xl mb-2">🎉</div>
              <h2 className="text-3xl font-black mb-1">It's a Match!</h2>
              <p className="text-white/80 text-sm mb-6">You and {matchModal?.profile.name} liked each other</p>

              {matchModal && (
                <div className="flex justify-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80" alt="You" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img src={matchModal.profile.photoUrl} alt={matchModal.profile.name} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  data-testid="button-send-message"
                  className="bg-white text-primary font-bold rounded-full py-3 hover:bg-white/90"
                  onClick={() => setMatchModal(null)}
                >
                  Send a Message
                </Button>
                <Button
                  data-testid="button-keep-swiping"
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-full"
                  onClick={() => setMatchModal(null)}
                >
                  Keep Swiping
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
