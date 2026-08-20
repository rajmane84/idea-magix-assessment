"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProfileImageUpload } from "@/components/shared/profile-image-upload";
import { PasswordInput } from "@/components/shared/password-input";
import { useDoctorSignUp } from "@/hooks/use-auth";
import { useUploadProfileImage } from "@/hooks/use-upload";
import { doctorSignUpSchema, type DoctorSignUpValues } from "@/lib/validation/auth";
import { emptyStringToUndefined } from "@/lib/validation/common";
import { RequiredMark } from "@/components/shared/required-mark";
import { SPECIALTIES, OTHER_SPECIALTY } from "@/lib/constants/specialties";
import { Loader2 } from "lucide-react";

export default function DoctorSignUpPage() {
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [specialtyOption, setSpecialtyOption] = useState("");
  const { mutate, isPending: isSigningUp } = useDoctorSignUp();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadProfileImage();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DoctorSignUpValues>({
    resolver: zodResolver(doctorSignUpSchema),
  });

  async function onSubmit(values: DoctorSignUpValues) {
    let profileImage = "";
    if (profileImageFile) {
      const uploaded = await uploadImage(profileImageFile).catch(() => null);
      if (!uploaded) return;
      profileImage = uploaded.url;
    }
    mutate({
      name: values.name,
      specialty: values.specialty,
      email: values.email,
      phone: values.phone,
      yearsOfExperience: values.yearsOfExperience,
      password: values.password,
      profileImage,
    });
  }

  const isPending = isUploading || isSigningUp;

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
              <ProfileImageUpload value={profileImageFile} onChange={setProfileImageFile} fallback="Dr" />

              <Field>
                <FieldLabel htmlFor="name">
                  Full Name
                  <RequiredMark />
                </FieldLabel>
                <Input id="name" placeholder="Jane Doe" {...register("name")} />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="specialty">
                  Specialty
                  <RequiredMark />
                </FieldLabel>
                <Controller
                  control={control}
                  name="specialty"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Select
                        value={specialtyOption}
                        onValueChange={(val) => {
                          if (!val) return;
                          setSpecialtyOption(val);
                          field.onChange(val === OTHER_SPECIALTY ? "" : val);
                        }}
                      >
                        <SelectTrigger id="specialty" className="w-full">
                          <SelectValue placeholder="Select a specialty" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64 overflow-y-auto">
                          {SPECIALTIES.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                          <SelectItem value={OTHER_SPECIALTY}>{OTHER_SPECIALTY}</SelectItem>
                        </SelectContent>
                      </Select>
                      {specialtyOption === OTHER_SPECIALTY && (
                        <Input
                          placeholder="Enter your specialty"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    </div>
                  )}
                />
                <FieldError errors={[errors.specialty]} />
              </Field>

              <Field orientation="responsive">
                <Field className="flex-1">
                  <FieldLabel htmlFor="email">
                    Email
                    <RequiredMark />
                  </FieldLabel>
                  <Input id="email" type="email" placeholder="doctor@example.com" {...register("email")} />
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
