import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}