"use client";

import { useState } from "react";
import { useRequireRole } from "@/hooks/use-require-role";
import { useMyConsultationsAsDoctor } from "@/hooks/use-consultations";
import { ConsultationListItem } from "@/components/doctor/consultation-list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

export default function DoctorPrescriptionsPage() {
  const { isReady } = useRequireRole("doctor", "/doctor/signin");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyConsultationsAsDoctor(page, PAGE_SIZE);
  const consultations = data?.consultations;
  const pagination = data?.pagination;

  if (!isReady) return null;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Consultations</h1>
        <p className="text-muted-foreground">Review submitted consultations and write prescriptions.</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {!isLoading && consultations && consultations.length === 0 && (
        <p className="text-center text-muted-foreground">No consultations yet.</p>
      )}

      {!isLoading && consultations && consultations.length > 0 && (
        <div className="space-y-3">
          {consultations.map((c) => (
            <ConsultationListItem key={c._id} consultation={c} />
          ))}
        </div>
      )}

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
    </div>
  );
}
