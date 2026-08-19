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
import { patientSignUpSchema, type PatientSignUpValues } from "@/lib/validation/auth";
import { emptyStringToUndefined } from "@/lib/validation/common";
import { RequiredMark } from "@/components/shared/required-mark";
import { PasswordInput } from "@/components/shared/password-input";
import { Loader2 } from "lucide-react";

export default function PatientSignUpPage() {
  const [profileImage, setProfileImage] = useState("");
  const { mutate, isPending } = usePatientSignUp();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PatientSignUpValues>({
    resolver: zodResolver(patientSignUpSchema),
    defaultValues: { surgeryHistory: "", illnessHistory: "" },
  });

  function onSubmit(values: PatientSignUpValues) {
    mutate({ ...values, profileImage });
  }

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
              <ProfileImageUpload value={profileImage} onChange={setProfileImage} fallback="P" />

              <Field orientation="responsive">
                <Field>
                  <FieldLabel htmlFor="name">
                    Full Name
                    <RequiredMark />
                  </FieldLabel>
                  <Input id="name" placeholder="John Smith" {...register("name")} />
                  <FieldError errors={[errors.name]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="age">
                    Age
                    <RequiredMark />
                  </FieldLabel>
                  <Input id="age" type="number" placeholder="30" min={1} max={150} {...register("age", { setValueAs: emptyStringToUndefined })} />
                  <FieldError errors={[errors.age]} />
                </Field>
              </Field>

              <Field orientation="responsive">
                <Field>
                  <FieldLabel htmlFor="email">
                    Email
                    <RequiredMark />
                  </FieldLabel>
                  <Input id="email" type="email" placeholder="patient@example.com" {...register("email")} />
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
