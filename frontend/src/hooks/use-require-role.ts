"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/session-provider";
import type { UserRole } from "@/types";

interface UseRequireRoleOptions {
  /** Set to false on the OTP verification page itself, to avoid a redirect loop. */
  requireVerified?: boolean;
}

/**
 * Redirects to `redirectTo` if the hydrated session doesn't match the required role, and
 * (unless opted out) redirects unverified users to their role's OTP verification page.
 */
export function useRequireRole(role: UserRole, redirectTo: string, options: UseRequireRoleOptions = {}) {
  const { requireVerified = true } = options;
  const session = useSession();
  const router = useRouter();

  const isVerified = session.doctor?.isVerified ?? session.patient?.isVerified ?? false;
  const verifyOtpPath = role === "doctor" ? "/doctor/verify-otp" : "/patient/verify-otp";

  useEffect(() => {
    if (!session.isHydrated) return;
    if (session.role !== role) {
      router.replace(redirectTo);
      return;
    }
    if (requireVerified && !isVerified) {
      router.replace(verifyOtpPath);
    }
  }, [session.isHydrated, session.role, role, redirectTo, requireVerified, isVerified, verifyOtpPath, router]);

  return {
    ...session,
    isReady: session.isHydrated && session.role === role && (!requireVerified || isVerified),
  };
}
