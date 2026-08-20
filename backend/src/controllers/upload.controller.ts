import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { cloudinaryService } from "../services/cloudinary.service";
import { deleteProfileImageSchema } from "../schemas/upload.schema";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const uploadProfileImage = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    throw new Error("No image file provided");
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed.");
  }

  if (!file.buffer || file.buffer.length === 0) {
    throw new Error("Cannot upload an empty file");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds the 5MB limit");
  }

  const { url, publicId } = await cloudinaryService.addProfileImage(file.buffer);

  res.status(201).json({
    success: true,
    message: "Profile image uploaded successfully",
    data: { url, publicId },
  });
});

export const deleteProfileImage = asyncHandler(async (req: Request, res: Response) => {
  const parsed = deleteProfileImageSchema.safeParse(req.body);

  if (!parsed.success) {
    throw parsed.error;
  }

  const { publicId } = parsed.data;

  await cloudinaryService.deleteProfileImage(publicId);

  res.status(200).json({
    success: true,
    message: "Profile image deleted successfully",
  });
});

