"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/session-provider";
import type { UserRole } from "@/types";

/** Redirects to the given sign-in path if the hydrated session doesn't match the required role. */
export function useRequireRole(role: UserRole, redirectTo: string) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.isHydrated && session.role !== role) {
      router.replace(redirectTo);
    }
  }, [session.isHydrated, session.role, role, redirectTo, router]);

  return { ...session, isReady: session.isHydrated && session.role === role };
}
