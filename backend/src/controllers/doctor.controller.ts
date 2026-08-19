import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { doctorService } from "../services/doctor.service";

export const listDoctors = asyncHandler(async (req: Request, res: Response) => {
  const doctors = await doctorService.listDoctors();
  res.json({ success: true, data: doctors });
});

export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await doctorService.getDoctorById(req.params.id as string);
  res.json({ success: true, data: doctor });
});
