"use client";

import { useState } from "react";
import { useRequireRole } from "@/hooks/use-require-role";
import { useDoctors } from "@/hooks/use-doctors";
import { DoctorCard } from "@/components/patient/doctor-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { ButtonLink } from "@/components/shared/button-link";

const PAGE_SIZE = 9;

export default function PatientDoctorsPage() {
  const { isReady } = useRequireRole("patient", "/patient/signin");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useDoctors(page, PAGE_SIZE);
  const doctors = data?.doctors;
  const pagination = data?.pagination;

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
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
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
