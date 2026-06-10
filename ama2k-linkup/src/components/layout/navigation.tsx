import { Link, useLocation } from "wouter";
import { Flame, MessageCircle, User, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useListMatches } from "@workspace/api-client-react";
import { useUnreadCounts } from "@/hooks/use-unread-counts";

export function Navigation() {
  const [location] = useLocation();
  const { data: matches = [] } = useListMatches();
  const { totalUnread } = useUnreadCounts(matches);

  const navItems = [
    { key: "discover", href: "/discover", icon: Flame, label: "Discover", badge: 0 },
    { key: "matches", href: "/matches", icon: Heart, label: "Matches", matchPrefix: "/matches", badge: 0 },
    { key: "messages", href: "/matches", icon: MessageCircle, label: "Messages", matchPrefix: "/messages", badge: totalUnread },
    { key: "profile", href: "/profile", icon: User, label: "Profile", badge: 0 },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border z-50">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.matchPrefix && location.startsWith(item.matchPrefix));
          return (
            <Link key={item.key} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-1 group">
              <div className="relative">
                <div className={cn(
                  "p-2 rounded-full transition-all duration-300",
                  isActive ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30" : "text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                )}>
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {item.badge > 0 && (
                  <span
                    data-testid={`badge-${item.key}`}
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm animate-in zoom-in-50 duration-200"
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
