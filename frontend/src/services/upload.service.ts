import { apiClient } from "@/lib/api-client";
import type { ApiSuccess } from "@/types";

export interface UploadedImage {
  url: string;
  publicId: string;
}

export const uploadService = {
  async uploadProfileImage(file: File): Promise<UploadedImage> {
    const formData = new FormData();
    formData.append("image", file);
    const res = await apiClient.post<ApiSuccess<UploadedImage>>("/uploads/profile-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  async deleteProfileImage(publicId: string): Promise<void> {
    await apiClient.delete("/uploads/profile-image", { data: { publicId } });
  },
};
