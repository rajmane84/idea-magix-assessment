import { apiClient } from "@/lib/api-client";
import type { ApiSuccess, Doctor } from "@/types";

export const doctorService = {
  async list() {
    const res = await apiClient.get<ApiSuccess<Doctor[]>>("/doctors");
    return res.data.data;
  },

  async getById(id: string) {
    const res = await apiClient.get<ApiSuccess<Doctor>>(`/doctors/${id}`);
    return res.data.data;
  },
};
