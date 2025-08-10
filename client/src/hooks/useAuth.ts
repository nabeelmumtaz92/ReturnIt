import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Only fetch once on mount
    refetchInterval: false,
    refetchOnReconnect: false,
  });

  return {
    user,
    isLoading: isLoading && !error, // Don't show loading if there's an error
    isAuthenticated: !!user,
    error,
  };
}