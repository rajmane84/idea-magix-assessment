import { apiClient } from "@/lib/api-client";
import type { ApiSuccess } from "@/types";

export const uploadService = {
  async uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append("image", file);
    const res = await apiClient.post<ApiSuccess<{ url: string }>>("/uploads/profile-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data.url;
  },
};
