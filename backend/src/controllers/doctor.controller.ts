import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Doctor } from "../models/Doctor";

export const listDoctors = asyncHandler(async (_req: Request, res: Response) => {
  const doctors = await Doctor.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: doctors });
});

export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  res.status(200).json({ success: true, data: doctor });
});
