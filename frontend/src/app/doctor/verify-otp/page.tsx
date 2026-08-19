"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireRole } from "@/hooks/use-require-role";
import { OtpVerificationForm } from "@/components/shared/otp-verification-form";

export default function DoctorVerifyOtpPage() {
  const { isReady, doctor } = useRequireRole("doctor", "/doctor/signin", { requireVerified: false });
  const router = useRouter();

  useEffect(() => {
    if (isReady && doctor?.isVerified) {
      router.replace("/doctor/profile");
    }
  }, [isReady, doctor?.isVerified, router]);

  if (!isReady || doctor?.isVerified) return null;

  return <OtpVerificationForm email={doctor?.email} />;
}
