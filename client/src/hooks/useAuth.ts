/**
 * Self-hosted auth hook wired to the platform's own auth router.
 * Replaces the template's external-OAuth useAuth.
 */
import { trpc } from "@/lib/trpc";

export function useAuth() {
  const utils = trpc.useUtils();
  const me = trpc.auth.me.useQuery(undefined, { retry: false });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => utils.auth.me.invalidate(),
  });

  return {
    user: me.data ?? null,
    loading: me.isLoading,
    isAuthenticated: Boolean(me.data),
    logout: () => logoutMutation.mutate(),
  };
}

