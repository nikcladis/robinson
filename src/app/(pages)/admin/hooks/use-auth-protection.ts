"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface UseAuthProtectionOptions {
  requireAdmin?: boolean;
  redirectTo?: string;
  redirectUnauthorizedTo?: string;
}

export function useAuthProtection({
  requireAdmin = false,
  redirectTo = "/auth/signin",
  redirectUnauthorizedTo = "/",
}: UseAuthProtectionOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(redirectTo);
    } else if (requireAdmin && session?.user?.role !== "ADMIN") {
      router.push(redirectUnauthorizedTo);
    }
  }, [
    status,
    session,
    router,
    requireAdmin,
    redirectTo,
    redirectUnauthorizedTo,
  ]);

  return {
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: session?.user?.role === "ADMIN",
  };
}
