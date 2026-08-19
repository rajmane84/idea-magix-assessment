import { z } from "zod";

export const deleteProfileImageSchema = z.object({
  publicId: z.string().trim().min(1, "publicId is required"),
});

export type DeleteProfileImageInput = z.infer<typeof deleteProfileImageSchema>;
