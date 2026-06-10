import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMyProfile, getGetMyProfileQueryKey } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const [, setLocation] = useLocation();
    const { data: profile, isLoading, error } = useGetMyProfile({
      query: {
        queryKey: getGetMyProfileQueryKey(),
        retry: false
      }
    });

    useEffect(() => {
      if (!isLoading && error) {
        // Assume 404 means no profile
        setLocation("/setup");
      }
    }, [isLoading, error, setLocation]);

    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[100dvh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!profile) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
