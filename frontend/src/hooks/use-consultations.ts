import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { consultationService, type CreateConsultationPayload } from "@/services/consultation.service";
import { extractErrorMessage } from "@/lib/api-client";

export function usePaymentQr(doctorId: string | undefined) {
  return useQuery({
    queryKey: ["payment-qr", doctorId],
    queryFn: () => consultationService.getPaymentQr(doctorId as string),
    enabled: Boolean(doctorId),
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateConsultationPayload) => consultationService.create(payload),
    onSuccess: () => {
      toast.success("Consultation submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useMyConsultationsAsPatient() {
  return useQuery({
    queryKey: ["consultations", "patient", "mine"],
    queryFn: () => consultationService.listMineAsPatient(),
  });
}

export function useMyConsultationsAsDoctor() {
  return useQuery({
    queryKey: ["consultations", "doctor", "mine"],
    queryFn: () => consultationService.listMineAsDoctor(),
  });
}

export function useConsultation(id: string | undefined) {
  return useQuery({
    queryKey: ["consultations", id],
    queryFn: () => consultationService.getById(id as string),
    enabled: Boolean(id),
  });
}
