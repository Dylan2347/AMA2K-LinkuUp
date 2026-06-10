import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import { Navigation } from "@/components/layout/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";

// Pages
import Discover from "@/pages/discover";
import Matches from "@/pages/matches";
import Messages from "@/pages/messages";
import Profile from "@/pages/profile";
import Setup from "@/pages/setup";
import Login from "@/pages/login";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  const [location] = useLocation();
  const { session, loading } = useAuth();

  // Connect to SSE for real-time match and message notifications
  useRealtimeEvents();

  const hideNav = location === "/setup" || location.startsWith("/messages/") || location === "/login";
  const isDiscover = location === "/" || location === "/discover";

  if (loading) {
    return (
      <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-background items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-background shadow-2xl relative overflow-hidden">
      <main className={`flex-1 relative z-0 ${isDiscover ? "overflow-hidden" : "overflow-y-auto hide-scrollbar"} ${!hideNav ? "pb-16" : ""}`}>
        <Switch>
          <Route path="/login" component={Login} />

          {/* All other routes require auth */}
          <Route path="/">
            {session ? <Discover /> : <Redirect to="/login" />}
          </Route>
          <Route path="/discover">
            {session ? <Discover /> : <Redirect to="/login" />}
          </Route>
          <Route path="/matches">
            {session ? <Matches /> : <Redirect to="/login" />}
          </Route>
          <Route path="/messages/:matchId">
            {session ? <Messages /> : <Redirect to="/login" />}
          </Route>
          <Route path="/profile">
            {session ? <Profile /> : <Redirect to="/login" />}
          </Route>
          <Route path="/setup">
            {session ? <Setup /> : <Redirect to="/login" />}
          </Route>

          <Route component={NotFound} />
        </Switch>
      </main>
      {!hideNav && session && <Navigation />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="min-h-screen bg-black flex items-center justify-center">
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </div>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
