import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListMatchesQueryKey, getListMessagesQueryKey } from "@workspace/api-client-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export function useRealtimeEvents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      if (cancelled) return;

      // Get the current Supabase session token
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return; // Not logged in — nothing to do

      // Clean up previous connection
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }

      const url = `/api/events?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.addEventListener("connected", () => {
        // Connected successfully — clear any pending reconnect timer
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
      });

      es.addEventListener("new_match", (e: MessageEvent) => {
        const data = JSON.parse(e.data) as { matchId: number; profile: { name: string; photoUrl: string } };

        // Refresh the matches list
        queryClient.invalidateQueries({ queryKey: getListMatchesQueryKey() });

        // Show a toast notification
        toast({
          title: `It's a match! 🎉`,
          description: `You and ${data.profile.name} liked each other.`,
          duration: 6000,
        });
      });

      es.addEventListener("new_message", (e: MessageEvent) => {
        const data = JSON.parse(e.data) as { theirMatchId: number | null; senderProfileId: number };

        // Refresh the matches list (updates last-message preview)
        queryClient.invalidateQueries({ queryKey: getListMatchesQueryKey() });

        // Refresh the specific conversation if the match ID is known
        if (data.theirMatchId != null) {
          queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(data.theirMatchId) });
        }
      });

      es.onerror = () => {
        // EventSource will try to reconnect automatically, but if the server
        // returns a non-200 (e.g., profile not set up yet) it won't retry.
        // We schedule our own reconnect so auth-token expiry is handled too.
        es.close();
        esRef.current = null;
        if (!cancelled) {
          reconnectTimer.current = setTimeout(() => connect(), 10_000);
        }
      };
    }

    connect();

    // Re-connect whenever the Supabase session changes (e.g. token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        connect();
      } else {
        // Logged out — close the connection
        esRef.current?.close();
        esRef.current = null;
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [queryClient, toast]);
}
