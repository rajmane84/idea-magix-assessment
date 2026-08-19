import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { cloudinaryService } from "../services/cloudinary.service";
import { deleteProfileImageSchema } from "../schemas/upload.schema";
import { ApiError } from "../utils/ApiError";

export const uploadProfileImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("No image file provided");
  const { url, publicId } = await cloudinaryService.addProfileImage(req.file.buffer);
  res.status(201).json({ success: true, data: { url, publicId } });
});

export const deleteProfileImage = asyncHandler(async (req: Request, res: Response) => {
  const { publicId } = deleteProfileImageSchema.parse(req.body);
  await cloudinaryService.deleteProfileImage(publicId);
  res.json({ success: true, message: "Image deleted" });
});
