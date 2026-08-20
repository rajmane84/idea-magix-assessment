"use client";

import { useState } from "react";
import { useRequireRole } from "@/hooks/use-require-role";
import { useMyPrescriptionsAsPatient } from "@/hooks/use-prescriptions";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PdfPreviewDialog } from "@/components/shared/pdf-preview-dialog";
import { resolveAssetUrl } from "@/lib/api-client";
import { format } from "date-fns";
import type { Doctor } from "@/types";

const PAGE_SIZE = 10;

export default function PatientPrescriptionsPage() {
  const { isReady } = useRequireRole("patient", "/patient/signin");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyPrescriptionsAsPatient(page, PAGE_SIZE);
  const prescriptions = data?.prescriptions;
  const pagination = data?.pagination;

  if (!isReady) return null;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Prescriptions</h1>
        <p className="text-muted-foreground">Prescriptions sent to you by doctors.</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {!isLoading && prescriptions && prescriptions.length === 0 && (
        <p className="text-center text-muted-foreground">No prescriptions received yet.</p>
      )}

      {!isLoading && prescriptions && prescriptions.length > 0 && (
        <>
          <div className="space-y-3">
            {prescriptions.map((prescription) => {
              const doctor = prescription.doctor as Doctor;
              return (
                <Card key={prescription._id}>
                  <CardContent className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={resolveAssetUrl(doctor?.profileImage)} alt={doctor?.name} />
                        <AvatarFallback>{doctor?.name?.charAt(0) ?? "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Dr. {doctor?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doctor?.specialty} • Sent{" "}
                          {prescription.sentAt ? format(new Date(prescription.sentAt), "MMM d, yyyy") : ""}
                        </p>
                      </div>
                    </div>
                    {resolveAssetUrl(prescription.pdfPath) && (
                      <PdfPreviewDialog
                        url={resolveAssetUrl(prescription.pdfPath)!}
                        downloadFilename={`Prescription-Dr-${doctor?.name ?? "Doctor"}-${format(
                          prescription.sentAt ? new Date(prescription.sentAt) : new Date(),
                          "yyyy-MM-dd"
                        )}`}
                        triggerSize="sm"
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
