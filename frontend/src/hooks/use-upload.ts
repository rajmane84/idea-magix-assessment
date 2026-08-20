import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadService } from "@/services/upload.service";
import { extractErrorMessage } from "@/lib/api-client";

export function useUploadProfileImage() {
  return useMutation({
    mutationFn: (file: File) => uploadService.uploadProfileImage(file),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeleteProfileImage() {
  return useMutation({
    mutationFn: (publicId: string) => uploadService.deleteProfileImage(publicId),
  });
}
