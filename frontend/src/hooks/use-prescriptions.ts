import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  prescriptionService,
  type CreatePrescriptionPayload,
  type UpdatePrescriptionPayload,
} from "@/services/prescription.service";
import { extractErrorMessage } from "@/lib/api-client";

export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePrescriptionPayload) => prescriptionService.create(payload),
    onSuccess: () => {
      toast.success("Prescription created and PDF generated");
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdatePrescription(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePrescriptionPayload) => prescriptionService.update(id, payload),
    onSuccess: () => {
      toast.success("Prescription updated");
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useSendPrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => prescriptionService.send(id),
    onSuccess: () => {
      toast.success("Prescription sent to patient");
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function usePrescriptionByConsultation(consultationId: string | undefined) {
  return useQuery({
    queryKey: ["prescriptions", "consultation", consultationId],
    queryFn: () => prescriptionService.getByConsultation(consultationId as string),
    enabled: Boolean(consultationId),
  });
}

export function useMyPrescriptionsAsPatient(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["prescriptions", "patient", "mine", page, limit],
    queryFn: () => prescriptionService.listMineAsPatient(page, limit),
    placeholderData: (previousData) => previousData,
  });
}

export function usePrescription(id: string | undefined) {
  return useQuery({
    queryKey: ["prescriptions", id],
    queryFn: () => prescriptionService.getById(id as string),
    enabled: Boolean(id),
  });
}
