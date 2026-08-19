import { apiClient } from "@/lib/api-client";
import type { ApiPaginated, ApiSuccess, Doctor } from "@/types";

export const doctorService = {
  async list(page = 1, limit = 10) {
    const res = await apiClient.get<ApiPaginated<Doctor[]>>("/doctors", {
      params: { page, limit },
    });
    return { doctors: res.data.data, pagination: res.data.pagination };
  },

  async getById(id: string) {
    const res = await apiClient.get<ApiSuccess<Doctor>>(`/doctors/${id}`);
    return res.data.data;
  },
};
