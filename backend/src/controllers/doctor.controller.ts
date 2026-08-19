import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Doctor } from "../models/Doctor";

export const listDoctors = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

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
