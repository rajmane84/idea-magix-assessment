import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { cloudinaryService } from "../services/cloudinary.service";
import { deleteProfileImageSchema } from "../schemas/upload.schema";

export const uploadProfileImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new Error("No image file provided");
  }

  const { url, publicId } = await cloudinaryService.addProfileImage(req.file.buffer);
  res.status(201).json({ success: true, data: { url, publicId } });
});

export const deleteProfileImage = asyncHandler(async (req: Request, res: Response) => {
  const parsed = deleteProfileImageSchema.safeParse(req.body);

  if (!parsed.success) {
    throw parsed.error;
  }

  await cloudinaryService.deleteProfileImage(parsed.data.publicId);
  res.status(200).json({ success: true, message: "Image deleted" });
});
