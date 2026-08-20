"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ProfileImageUpload } from "@/components/shared/profile-image-upload";
import { IllnessTagInput } from "@/components/shared/illness-tag-input";
import { usePatientSignUp } from "@/hooks/use-auth";
import { useRedirectIfAuthenticated } from "@/hooks/use-redirect-if-authenticated";
import { useUploadProfileImage } from "@/hooks/use-upload";
import { patientSignUpSchema, type PatientSignUpValues } from "@/lib/validation/auth";
import { emptyStringToUndefined } from "@/lib/validation/common";
import { RequiredMark } from "@/components/shared/required-mark";
import { PasswordInput } from "@/components/shared/password-input";
import { Loader2 } from "lucide-react";

export default function PatientSignUpPage() {
  const { isReady } = useRedirectIfAuthenticated();
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const { mutate, isPending: isSigningUp } = usePatientSignUp();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadProfileImage();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PatientSignUpValues>({
    resolver: zodResolver(patientSignUpSchema),
    defaultValues: { surgeryHistory: "", illnessHistory: "" },
  });

  async function onSubmit(values: PatientSignUpValues) {
    let profileImage = "";
    if (profileImageFile) {
      const uploaded = await uploadImage(profileImageFile).catch(() => null);
      if (!uploaded) return;
      profileImage = uploaded.url;
    }
    mutate({
      name: values.name,
      age: values.age,
      email: values.email,
      phone: values.phone,
      surgeryHistory: values.surgeryHistory,
      illnessHistory: values.illnessHistory,
      password: values.password,
      profileImage,
    });
  }

  const isPending = isUploading || isSigningUp;

  if (!isReady) return null;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Patient Sign Up</CardTitle>
          <CardDescription>Create your account to consult with doctors.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <ProfileImageUpload value={profileImageFile} onChange={setProfileImageFile} fallback="P" />

              <Field orientation="responsive">
                <Field className="flex-1">
                  <FieldLabel htmlFor="name">
                    Full Name
                    <RequiredMark />
                  </FieldLabel>
                  <Input id="name" placeholder="John Smith" {...register("name")} />
                  <FieldError errors={[errors.name]} />
                </Field>
                <Field className="flex-1">
                  <FieldLabel htmlFor="age">
                    Age
                    <RequiredMark />
                  </FieldLabel>
                  <Input id="age" type="number" placeholder="30" min={1} max={150} {...register("age", { setValueAs: emptyStringToUndefined })} />
                  <FieldError errors={[errors.age]} />
                </Field>
              </Field>

              <Field orientation="responsive">
                <Field className="flex-1">
                  <FieldLabel htmlFor="email">
                    Email
                    <RequiredMark />
                  </FieldLabel>
                  <Input id="email" type="email" placeholder="patient@example.com" {...register("email")} />
                  <FieldError errors={[errors.email]} />
                </Field>
                <Field className="flex-1">
                  <FieldLabel htmlFor="phone">
                    Phone Number
                    <RequiredMark />
                  </FieldLabel>
                  <Input id="phone" placeholder="9876543210" {...register("phone")} />
                  <FieldError errors={[errors.phone]} />
                </Field>
              </Field>

              <Field>
                <FieldLabel htmlFor="surgeryHistory">History of Surgery</FieldLabel>
                <Textarea
                  id="surgeryHistory"
                  placeholder="Appendix removal in 2020"
                  {...register("surgeryHistory")}
                />
                <FieldError errors={[errors.surgeryHistory]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="illnessHistory">History of Illness (comma separated)</FieldLabel>
                <Controller
                  control={control}
                  name="illnessHistory"
                  render={({ field }) => (
                    <IllnessTagInput id="illnessHistory" value={field.value ?? ""} onChange={field.onChange} />
                  )}
                />
                <FieldError errors={[errors.illnessHistory]} />
              </Field>

              <Field orientation="responsive">
                <Field className="flex-1">
                  <FieldLabel htmlFor="password">
                    Password
                    <RequiredMark />
                  </FieldLabel>
                  <PasswordInput id="password" placeholder="••••••••" {...register("password")} />
                  <FieldError errors={[errors.password]} />
                </Field>
                <Field className="flex-1">
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm Password
                    <RequiredMark />
                  </FieldLabel>
                  <PasswordInput id="confirmPassword" placeholder="••••••••" {...register("confirmPassword")} />
                  <FieldError errors={[errors.confirmPassword]} />
                </Field>
              </Field>

              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create account
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/patient/signin" className="font-medium text-primary underline underline-offset-4">
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
