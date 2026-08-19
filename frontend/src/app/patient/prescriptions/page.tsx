"use client";

import { useRequireRole } from "@/hooks/use-require-role";
import { useMyPrescriptionsAsPatient } from "@/hooks/use-prescriptions";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveAssetUrl } from "@/lib/api-client";
import { format } from "date-fns";
import { Download } from "lucide-react";
import type { Doctor } from "@/types";

export default function PatientPrescriptionsPage() {
  const { isReady } = useRequireRole("patient", "/patient/signin");
  const { data: prescriptions, isLoading } = useMyPrescriptionsAsPatient();

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
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={
                      <a
                        href={resolveAssetUrl(prescription.pdfPath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      />
                    }
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
