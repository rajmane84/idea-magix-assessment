"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireRole } from "@/hooks/use-require-role";
import { OtpVerificationForm } from "@/components/shared/otp-verification-form";

export default function PatientVerifyOtpPage() {
  const { isReady, patient } = useRequireRole("patient", "/patient/signin", { requireVerified: false });
  const router = useRouter();

  useEffect(() => {
    if (isReady && patient?.isVerified) {
      router.replace("/patient/doctors");
    }
  }, [isReady, patient?.isVerified, router]);

  if (!isReady || patient?.isVerified) return null;

  return <OtpVerificationForm email={patient?.email} />;
}
