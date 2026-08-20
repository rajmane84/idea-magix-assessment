"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useVerifyOtp, useResendOtp } from "@/hooks/use-auth";
import { verifyOtpSchema, type VerifyOtpValues } from "@/lib/validation/auth";
import { Loader2, MailCheck } from "lucide-react";

const RESEND_COOLDOWN_SECONDS = 60;

function cooldownStorageKey(email?: string) {
  return `otp-resend-until:${email ?? "unknown"}`;
}

function readStoredUntil(email?: string): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(cooldownStorageKey(email));
  return raw === null ? null : Number(raw);
}

function remainingSeconds(until: number | null) {
  if (until === null) return 0;
  return Math.max(Math.ceil((until - Date.now()) / 1000), 0);
}

function startCooldown(email?: string) {
  const until = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;
  window.localStorage.setItem(cooldownStorageKey(email), String(until));
  return RESEND_COOLDOWN_SECONDS;
}

export function OtpVerificationForm({ email }: { email?: string }) {
  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();
  const [cooldown, setCooldown] = useState(() => {
    const until = readStoredUntil(email);
    return until === null ? RESEND_COOLDOWN_SECONDS : remainingSeconds(until);
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (readStoredUntil(email) === null) startCooldown(email);
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(remainingSeconds(readStoredUntil(email))), 1000);
    return () => clearInterval(timer);
  }, [cooldown, email]);

  function handleResend() {
    resendOtp(undefined, { onSuccess: () => setCooldown(startCooldown(email)) });
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <MailCheck className="mb-2 h-10 w-10 text-primary" />
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a 6-digit verification code to {email ? <strong>{email}</strong> : "your email"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((values) => verifyOtp(values.code))}>
            <FieldGroup>
              <Field className="items-center">
                <Controller
                  control={control}
                  name="code"
                  render={({ field }) => (
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      containerClassName="justify-center"
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  )}
                />
                <FieldError errors={[errors.code]} />
              </Field>

              <Button type="submit" disabled={isVerifying}>
                {isVerifying && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify account
              </Button>

              <Button
                type="button"
                variant="ghost"
                disabled={isResending || cooldown > 0}
                onClick={handleResend}
              >
                {isResending && <Loader2 className="h-4 w-4 animate-spin" />}
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
