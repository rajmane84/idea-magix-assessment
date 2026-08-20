"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDoctorSignIn } from "@/hooks/use-auth";
import { useRedirectIfAuthenticated } from "@/hooks/use-redirect-if-authenticated";
import { doctorSignInSchema, type DoctorSignInValues } from "@/lib/validation/auth";
import { RequiredMark } from "@/components/shared/required-mark";
import { PasswordInput } from "@/components/shared/password-input";
import { Loader2 } from "lucide-react";

export default function DoctorSignInPage() {
  const { isReady } = useRedirectIfAuthenticated();
  const { mutate, isPending } = useDoctorSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorSignInValues>({ resolver: zodResolver(doctorSignInSchema) });

  if (!isReady) return null;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Doctor Sign In</CardTitle>
          <CardDescription>Welcome back. Sign in to manage your consultations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((values) => mutate(values))}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">
                  Email
                  <RequiredMark />
                </FieldLabel>
                <Input id="email" type="email" placeholder="doctor@example.com" {...register("email")} />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">
                  Password
                  <RequiredMark />
                </FieldLabel>
                <PasswordInput id="password" placeholder="••••••••" {...register("password")} />
                <FieldError errors={[errors.password]} />
              </Field>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign in
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/doctor/signup" className="font-medium text-primary underline underline-offset-4">
                  Sign up
                </Link>
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
