"use client";

import { useState } from "react";
import { useRequireRole } from "@/hooks/use-require-role";
import { useConsultation } from "@/hooks/use-consultations";
import {
  usePrescriptionByConsultation,
  useCreatePrescription,
  useUpdatePrescription,
  useSendPrescription,
} from "@/hooks/use-prescriptions";
import { ConsultationDetails } from "@/components/doctor/consultation-details";
import { format } from "date-fns";
import type { Patient } from "@/types";
import { PrescriptionForm } from "@/components/doctor/prescription-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PdfPreviewDialog } from "@/components/shared/pdf-preview-dialog";
import { resolveAssetUrl } from "@/lib/api-client";
import type { PrescriptionFormValues } from "@/lib/validation/prescription";
import { Pencil, Send, Loader2 } from "lucide-react";

export function PrescriptionWorkspace({ consultationId }: { consultationId: string }) {
  const { isReady } = useRequireRole("doctor", "/doctor/signin");
  const { data: consultation, isLoading: isConsultationLoading } = useConsultation(consultationId);
  const { data: prescription, isLoading: isPrescriptionLoading } = usePrescriptionByConsultation(consultationId);

  const [isEditing, setIsEditing] = useState(false);

  const createPrescription = useCreatePrescription();
  const updatePrescription = useUpdatePrescription(prescription?._id ?? "");
  const sendPrescription = useSendPrescription();

  if (!isReady) return null;

  const isLoading = isConsultationLoading || isPrescriptionLoading;

  function handleCreate(values: PrescriptionFormValues) {
    createPrescription.mutate({ consultationId, careToBeTaken: values.careToBeTaken, medicines: values.medicines ?? [] });
  }

  function handleUpdate(values: PrescriptionFormValues) {
    updatePrescription.mutate(
      { careToBeTaken: values.careToBeTaken, medicines: values.medicines ?? [] },
      { onSuccess: () => setIsEditing(false) }
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold">Consultation & Prescription</h1>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!isLoading && consultation && <ConsultationDetails consultation={consultation} />}

      {!isLoading && !prescription && (
        <PrescriptionForm
          onSubmit={handleCreate}
          isSubmitting={createPrescription.isPending}
          submitLabel="Save & Generate PDF"
        />
      )}

      {!isLoading && prescription && !isEditing && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Prescription</CardTitle>
            <Badge variant={prescription.sentToPatient ? "default" : "secondary"}>
              {prescription.sentToPatient ? "Sent to patient" : "Not sent"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Care to be taken</p>
              <p className="text-sm text-muted-foreground">{prescription.careToBeTaken}</p>
            </div>

            {prescription.medicines.length > 0 && (
              <div>
                <p className="mb-2 font-medium">Medicines</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {prescription.medicines.map((med, idx) => (
                    <li key={idx}>
                      {idx + 1}. {med.name}
                      {[med.dosage, med.frequency, med.duration].filter(Boolean).length > 0 &&
                        ` — ${[med.dosage, med.frequency, med.duration].filter(Boolean).join(", ")}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              {resolveAssetUrl(prescription.pdfPath) && (
                <PdfPreviewDialog
                  url={resolveAssetUrl(prescription.pdfPath)!}
                  downloadFilename={`Prescription-${(consultation?.patient as Patient)?.name ?? "Patient"}-${format(
                    prescription.createdAt ? new Date(prescription.createdAt) : new Date(),
                    "yyyy-MM-dd"
                  )}`}
                />
              )}
              <Button
                onClick={() => sendPrescription.mutate(prescription._id)}
                disabled={sendPrescription.isPending}
              >
                {sendPrescription.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {prescription.sentToPatient ? "Resend to patient" : "Send to patient"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && prescription && isEditing && (
        <PrescriptionForm
          defaultValues={{ careToBeTaken: prescription.careToBeTaken, medicines: prescription.medicines }}
          onSubmit={handleUpdate}
          isSubmitting={updatePrescription.isPending}
          submitLabel="Update & Regenerate PDF"
        />
      )}
    </div>
  );
}
