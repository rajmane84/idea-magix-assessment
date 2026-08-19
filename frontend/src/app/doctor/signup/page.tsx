"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProfileImageUpload } from "@/components/shared/profile-image-upload";
import { PasswordInput } from "@/components/shared/password-input";
import { useDoctorSignUp } from "@/hooks/use-auth";
import { doctorSignUpSchema, type DoctorSignUpValues } from "@/lib/validation/auth";
import { emptyStringToUndefined } from "@/lib/validation/common";
import { RequiredMark } from "@/components/shared/required-mark";
import { Loader2 } from "lucide-react";

export default function DoctorSignUpPage() {
  const [profileImage, setProfileImage] = useState("");
  const { mutate, isPending } = useDoctorSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorSignUpValues>({
    resolver: zodResolver(doctorSignUpSchema),
  });

  function onSubmit(values: DoctorSignUpValues) {
    mutate({ ...values, profileImage });
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Doctor Sign Up</CardTitle>
          <CardDescription>Create your doctor account to start consulting patients.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <ProfileImageUpload value={profileImage} onChange={setProfileImage} fallback="Dr" />

              <Field>
                <FieldLabel htmlFor="name">
                  Full Name
                  <RequiredMark />
                </FieldLabel>
                <Input id="name" placeholder="Dr. Jane Doe" {...register("name")} />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="specialty">
                  Specialty
                  <RequiredMark />
                </FieldLabel>
                <Input id="specialty" placeholder="Cardiology" {...register("specialty")} />
                <FieldError errors={[errors.specialty]} />
              </Field>

              <Field orientation="responsive">
                <Field>
                  <FieldLabel htmlFor="email">
                    Email
                    <RequiredMark />
                  </FieldLabel>
                  <Input id="email" type="email" placeholder="doctor@example.com" {...register("email")} />
                  <FieldError errors={[errors.email]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">
                    Phone Number
                    <RequiredMark />
                  </FieldLabel>
                  <Input id="phone" placeholder="9876543210" {...register("phone")} />
                  <FieldError errors={[errors.phone]} />
                </Field>
              </Field>

              <Field>
                <FieldLabel htmlFor="yearsOfExperience">
                  Years of Experience
                  <RequiredMark />
                </FieldLabel>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  step="0.1"
                  placeholder="1.5"
                  min={0}
                  {...register("yearsOfExperience", { setValueAs: emptyStringToUndefined })}
                />
                <FieldError errors={[errors.yearsOfExperience]} />
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
                Create account
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/doctor/signin" className="font-medium text-primary underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
