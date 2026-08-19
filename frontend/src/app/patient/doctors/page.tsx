"use client";

import { useRequireRole } from "@/hooks/use-require-role";
import { useDoctors } from "@/hooks/use-doctors";
import { DoctorCard } from "@/components/patient/doctor-card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import { ButtonLink } from "@/components/shared/button-link";

export default function PatientDoctorsPage() {
  const { isReady } = useRequireRole("patient", "/patient/signin");
  const { data: doctors, isLoading } = useDoctors();

  if (!isReady) return null;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Find a Doctor</h1>
          <p className="text-muted-foreground">Browse doctors and start a consultation.</p>
        </div>
        <ButtonLink href="/patient/prescriptions" variant="outline">
          <FileText className="h-4 w-4" />
          My Prescriptions
        </ButtonLink>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      )}

      {!isLoading && doctors && doctors.length === 0 && (
        <p className="text-center text-muted-foreground">No doctors available yet.</p>
      )}

      {!isLoading && doctors && doctors.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}
