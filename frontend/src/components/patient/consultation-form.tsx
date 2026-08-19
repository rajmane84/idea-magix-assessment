"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRequireRole } from "@/hooks/use-require-role";
import { useDoctor } from "@/hooks/use-doctors";
import { usePaymentQr, useCreateConsultation } from "@/hooks/use-consultations";
import {
  consultationStepOneSchema,
  consultationStepTwoSchema,
  consultationStepThreeSchema,
} from "@/lib/validation/consultation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveAssetUrl } from "@/lib/api-client";
import { RequiredMark } from "@/components/shared/required-mark";
import { Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";

const fullSchema = consultationStepOneSchema
  .extend(consultationStepTwoSchema.shape)
  .extend(consultationStepThreeSchema.shape);
type FormValues = z.infer<typeof fullSchema>;

const STEP_FIELDS = [
  ["currentIllnessHistory", "hadRecentSurgery", "surgeryDetails", "surgeryTimeSpan"],
  ["diabetesStatus", "allergies", "others"],
  ["transactionId"],
] as const;

const STEP_TITLES = ["Illness & Surgery History", "Family Medical History", "Payment"];

export function ConsultationForm({ doctorId }: { doctorId: string }) {
  const { isReady } = useRequireRole("patient", "/patient/signin");
  const { data: doctor, isLoading: isDoctorLoading } = useDoctor(doctorId);
  const { data: paymentInfo, isLoading: isQrLoading } = usePaymentQr(doctorId);
  const { mutate: createConsultation, isPending, isSuccess } = useCreateConsultation();
  const router = useRouter();
  const [step, setStep] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      hadRecentSurgery: false,
      surgeryDetails: "",
      surgeryTimeSpan: "",
      allergies: "",
      others: "",
    },
  });

  const hadRecentSurgery = watch("hadRecentSurgery");

  async function goNext() {
    const fields = STEP_FIELDS[step];
    const valid = await trigger(Array.from(fields) as (keyof FormValues)[]);
    if (valid) setStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function onSubmit(values: FormValues) {
    createConsultation(
      { doctorId, ...values },
      { onSuccess: () => router.push("/patient/doctors") }
    );
  }

  if (!isReady) return null;

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <Card>
        <CardHeader>
          {isDoctorLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <CardTitle>Consult Dr. {doctor?.name}</CardTitle>
          )}
          <CardDescription>{doctor?.specialty}</CardDescription>

          <div className="mt-4 flex items-center gap-2">
            {STEP_TITLES.map((title, idx) => (
              <div key={title} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                    idx <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {idx < step ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </div>
                {idx < STEP_TITLES.length - 1 && <div className="h-px flex-1 bg-border" />}
              </div>
            ))}
          </div>
          <p className="text-sm font-medium text-muted-foreground">{STEP_TITLES[step]}</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 0 && (
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="currentIllnessHistory">
                    Current Illness History
                    <RequiredMark />
                  </FieldLabel>
                  <Textarea
                    id="currentIllnessHistory"
                    placeholder="Describe your current symptoms and illness"
                    {...register("currentIllnessHistory")}
                  />
                  <FieldError errors={[errors.currentIllnessHistory]} />
                </Field>

                <Field orientation="horizontal">
                  <FieldLabel htmlFor="hadRecentSurgery">Recent Surgery</FieldLabel>
                  <Controller
                    control={control}
                    name="hadRecentSurgery"
                    render={({ field }) => (
                      <Switch id="hadRecentSurgery" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </Field>

                {hadRecentSurgery && (
                  <>
                    <Field>
                      <FieldLabel htmlFor="surgeryDetails">Surgery Details</FieldLabel>
                      <Textarea id="surgeryDetails" placeholder="What surgery did you have?" {...register("surgeryDetails")} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="surgeryTimeSpan">Time Span (e.g. 6 months ago)</FieldLabel>
                      <Input id="surgeryTimeSpan" placeholder="6 months ago" {...register("surgeryTimeSpan")} />
                    </Field>
                  </>
                )}
              </FieldGroup>
            )}

            {step === 1 && (
              <FieldGroup>
                <Field>
                  <FieldLabel>
                    Diabetic Status
                    <RequiredMark />
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="diabetesStatus"
                    render={({ field }) => (
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="diabetic" id="diabetic" />
                          <FieldLabel htmlFor="diabetic" className="font-normal">
                            Diabetic
                          </FieldLabel>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="non-diabetic" id="non-diabetic" />
                          <FieldLabel htmlFor="non-diabetic" className="font-normal">
                            Non-Diabetic
                          </FieldLabel>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  <FieldError errors={[errors.diabetesStatus]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="allergies">Any Allergies</FieldLabel>
                  <Input id="allergies" placeholder="e.g. Penicillin" {...register("allergies")} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="others">Others</FieldLabel>
                  <Textarea id="others" placeholder="Any other family medical history" {...register("others")} />
                </Field>
              </FieldGroup>
            )}

            {step === 2 && (
              <FieldGroup>
                <div className="flex flex-col items-center gap-3 rounded-lg border p-4">
                  {isQrLoading ? (
                    <Skeleton className="h-48 w-48" />
                  ) : paymentInfo ? (
                    <Image
                      src={resolveAssetUrl(paymentInfo.qrCodeImage) ?? ""}
                      alt="Payment QR Code"
                      width={192}
                      height={192}
                      unoptimized
                    />
                  ) : null}
                  <p className="text-sm text-muted-foreground">
                    Scan to pay <span className="font-semibold text-foreground">₹{paymentInfo?.amount ?? 500}</span>{" "}
                    consultation fee
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="transactionId">
                    Transaction ID
                    <RequiredMark />
                  </FieldLabel>
                  <Input id="transactionId" placeholder="Enter payment transaction ID" {...register("transactionId")} />
                  <FieldError errors={[errors.transactionId]} />
                </Field>
              </FieldGroup>
            )}

            <div className="mt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}>
                Back
              </Button>

              {step < STEP_TITLES.length - 1 ? (
                <Button type="button" onClick={goNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isPending || isSuccess}>
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Consultation
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
