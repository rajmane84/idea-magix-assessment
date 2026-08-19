import { apiClient } from "@/lib/api-client";
import type { ApiSuccess, Medicine, Prescription } from "@/types";

export interface CreatePrescriptionPayload {
  consultationId: string;
  careToBeTaken: string;
  medicines: Medicine[];
}

export interface UpdatePrescriptionPayload {
  careToBeTaken: string;
  medicines: Medicine[];
}

export const prescriptionService = {
  async create(payload: CreatePrescriptionPayload) {
    const res = await apiClient.post<ApiSuccess<Prescription>>("/prescriptions", payload);
    return res.data.data;
  },

  async update(id: string, payload: UpdatePrescriptionPayload) {
    const res = await apiClient.put<ApiSuccess<Prescription>>(`/prescriptions/${id}`, payload);
    return res.data.data;
  },

  async send(id: string) {
    const res = await apiClient.post<ApiSuccess<Prescription>>(`/prescriptions/${id}/send`);
    return res.data.data;
  },

  async getByConsultation(consultationId: string) {
    const res = await apiClient.get<ApiSuccess<Prescription | null>>(`/prescriptions/consultation/${consultationId}`);
    return res.data.data;
  },

  async listMineAsPatient() {
    const res = await apiClient.get<ApiSuccess<Prescription[]>>("/prescriptions/mine");
    return res.data.data;
  },

  async getById(id: string) {
    const res = await apiClient.get<ApiSuccess<Prescription>>(`/prescriptions/${id}`);
    return res.data.data;
  },
};
