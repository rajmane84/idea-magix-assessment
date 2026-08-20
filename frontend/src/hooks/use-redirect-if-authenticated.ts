"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/session-provider";

export function useRedirectIfAuthenticated() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session.isHydrated || !session.role) return;

    if (session.role === "doctor") {
      router.replace(session.doctor?.isVerified ? "/doctor/profile" : "/doctor/verify-otp");
    } else {
      router.replace(session.patient?.isVerified ? "/patient/doctors" : "/patient/verify-otp");
    }
  }, [session.isHydrated, session.role, session.doctor, session.patient, router]);

  return { isReady: session.isHydrated && !session.role };
}
