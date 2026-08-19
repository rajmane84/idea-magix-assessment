import { apiClient } from "@/lib/api-client";
import type { ApiSuccess, Doctor, Patient } from "@/types";

export interface DoctorSignUpPayload {
  name: string;
  specialty: string;
  email: string;
  phone: string;
  yearsOfExperience: number;
  password: string;
  profileImage?: string;
}

export interface DoctorSignInPayload {
  email: string;
  password: string;
}

export interface PatientSignUpPayload {
  name: string;
  age: number;
  email: string;
  phone: string;
  surgeryHistory?: string;
  illnessHistory?: string; // comma separated, split server-side
  password: string;
  profileImage?: string;
}

export interface PatientSignInPayload {
  email: string;
  password: string;
}

export const authService = {
  async doctorSignUp(payload: DoctorSignUpPayload) {
    const res = await apiClient.post<ApiSuccess<{ doctor: Doctor }>>("/auth/doctor/signup", payload);
    return res.data.data;
  },

  async doctorSignIn(payload: DoctorSignInPayload) {
    const res = await apiClient.post<ApiSuccess<{ doctor: Doctor }>>("/auth/doctor/signin", payload);
    return res.data.data;
  },

  async patientSignUp(payload: PatientSignUpPayload) {
    const res = await apiClient.post<ApiSuccess<{ patient: Patient }>>("/auth/patient/signup", payload);
    return res.data.data;
  },

  async patientSignIn(payload: PatientSignInPayload) {
    const res = await apiClient.post<ApiSuccess<{ patient: Patient }>>("/auth/patient/signin", payload);
    return res.data.data;
  },

  async logout() {
    await apiClient.post("/auth/logout");
  },

  async me() {
    const res = await apiClient.get<ApiSuccess<{ role: "doctor"; doctor: Doctor } | { role: "patient"; patient: Patient }>>(
      "/auth/me"
    );
    return res.data.data;
  },

  async verifyOtp(code: string) {
    const res = await apiClient.post<ApiSuccess<{ doctor: Doctor } | { patient: Patient }>>("/auth/verify-otp", {
      code,
    });
    return res.data.data;
  },

  async resendOtp() {
    await apiClient.post("/auth/resend-otp");
  },
};
