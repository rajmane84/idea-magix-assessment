import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Doctor } from "../models/Doctor";
import { paginationQuerySchema } from "../schemas/shared.schema";

export const listDoctors = asyncHandler(async (req: Request, res: Response) => {
  const parsed = paginationQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw parsed.error;
  }

  const { page, limit, skip } = parsed.data;

  const [doctors, total] = await Promise.all([
    Doctor.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Doctor.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: doctors,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await Doctor.findById(String(req.params.id));
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  res.status(200).json({ success: true, data: doctor });
});
