import { useState, useCallback } from "react";

const STORAGE_KEY = "ama2k_last_seen";

function getLastSeen(): Record<number, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function markMatchAsRead(matchId: number) {
  const current = getLastSeen();
  current[matchId] = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function useUnreadCounts(matches: Array<{ id: number; lastMessageAt?: string | null; lastMessage?: string | null }>) {
  const [lastSeen, setLastSeenState] = useState<Record<number, string>>(getLastSeen);

  const unreadByMatch = matches.reduce<Record<number, boolean>>((acc, match) => {
    if (!match.lastMessageAt || !match.lastMessage) return acc;
    const seen = lastSeen[match.id];
    acc[match.id] = !seen || new Date(match.lastMessageAt) > new Date(seen);
    return acc;
  }, {});

  const totalUnread = Object.values(unreadByMatch).filter(Boolean).length;

  const markRead = useCallback((matchId: number) => {
    markMatchAsRead(matchId);
    setLastSeenState(getLastSeen());
  }, []);

  return { unreadByMatch, totalUnread, markRead };
}
