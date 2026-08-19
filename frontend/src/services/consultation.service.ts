import { apiClient } from "@/lib/api-client";
import type { ApiSuccess, Consultation } from "@/types";

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

  async listMineAsPatient() {
    const res = await apiClient.get<ApiSuccess<Consultation[]>>("/consultations/mine");
    return res.data.data;
  },

  async listMineAsDoctor() {
    const res = await apiClient.get<ApiSuccess<Consultation[]>>("/consultations/doctor/mine");
    return res.data.data;
  },

  async getById(id: string) {
    const res = await apiClient.get<ApiSuccess<Consultation>>(`/consultations/${id}`);
    return res.data.data;
  },
};
