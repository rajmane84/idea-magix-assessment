import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const uploadController = {
  uploadProfileImage: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest("No image file provided");
    const url = `/uploads/profiles/${req.file.filename}`;
    res.status(201).json({ success: true, data: { url } });
  }),
};
