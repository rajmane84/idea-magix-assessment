"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { prescriptionFormSchema, type PrescriptionFormValues } from "@/lib/validation/prescription";
import { RequiredMark } from "@/components/shared/required-mark";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface PrescriptionFormProps {
  defaultValues?: PrescriptionFormValues;
  onSubmit: (values: PrescriptionFormValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

export function PrescriptionForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: PrescriptionFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: defaultValues ?? { careToBeTaken: "", medicines: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "medicines" });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write Prescription</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="careToBeTaken">
                Care to be taken
                <RequiredMark />
              </FieldLabel>
              <Textarea
                id="careToBeTaken"
                placeholder="Rest, hydration, dietary advice, follow-ups, etc."
                {...register("careToBeTaken")}
              />
              <FieldError errors={[errors.careToBeTaken]} />
            </Field>

            <Separator />

            <div className="flex items-center justify-between">
              <FieldLabel>Medicines</FieldLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", dosage: "", frequency: "", duration: "" })}
              >
                <Plus className="h-4 w-4" />
                Add medicine
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">No medicines added yet.</p>
            )}

            {fields.map((field, index) => (
              <div key={field.id} className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Medicine {index + 1}</p>
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor={`medicines.${index}.name`}>
                      Name
                      <RequiredMark />
                    </FieldLabel>
                    <Input
                      id={`medicines.${index}.name`}
                      placeholder="Paracetamol"
                      {...register(`medicines.${index}.name` as const)}
                    />
                    <FieldError errors={[errors.medicines?.[index]?.name]} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`medicines.${index}.dosage`}>Dosage</FieldLabel>
                    <Input
                      id={`medicines.${index}.dosage`}
                      placeholder="500mg"
                      {...register(`medicines.${index}.dosage` as const)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`medicines.${index}.frequency`}>Frequency</FieldLabel>
                    <Input
                      id={`medicines.${index}.frequency`}
                      placeholder="Twice a day"
                      {...register(`medicines.${index}.frequency` as const)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`medicines.${index}.duration`}>Duration</FieldLabel>
                    <Input
                      id={`medicines.${index}.duration`}
                      placeholder="5 days"
                      {...register(`medicines.${index}.duration` as const)}
                    />
                  </Field>
                </div>
              </div>
            ))}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
