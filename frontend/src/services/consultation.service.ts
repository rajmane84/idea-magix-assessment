import { apiClient } from "@/lib/api-client";
import type { ApiPaginated, ApiSuccess, Consultation } from "@/types";

export interface CreateConsultationPayload {
  doctorId: string;
  currentIllnessHistory: string;
  hadRecentSurgery: boolean;
  surgeryDetails?: string;
  surgeryTimeSpan?: string;
  diabetesStatus: "diabetic" | "non-diabetic";
  allergies?: string;
  others?: string;
  transactionId: string;
}

export const consultationService = {
  async getPaymentQr(doctorId: string) {
    const res = await apiClient.get<ApiSuccess<{ qrCodeImage: string; amount: number }>>(
      `/consultations/payment-qr/${doctorId}`
    );
    return res.data.data;
  },

  async create(payload: CreateConsultationPayload) {
    const res = await apiClient.post<ApiSuccess<Consultation>>("/consultations", payload);
    return res.data.data;
  },

  async listMineAsPatient(page = 1, limit = 10) {
    const res = await apiClient.get<ApiPaginated<Consultation[]>>("/consultations/mine", {
      params: { page, limit },
    });
    return { consultations: res.data.data, pagination: res.data.pagination };
  },

  async listMineAsDoctor(page = 1, limit = 10) {
    const res = await apiClient.get<ApiPaginated<Consultation[]>>("/consultations/doctor/mine", {
      params: { page, limit },
    });
    return { consultations: res.data.data, pagination: res.data.pagination };
  },

  async getById(id: string) {
    const res = await apiClient.get<ApiSuccess<Consultation>>(`/consultations/${id}`);
    return res.data.data;
  },
};
