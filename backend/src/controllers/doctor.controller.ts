import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { doctorService } from "../services/doctor.service";

export const doctorController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const doctors = await doctorService.listDoctors();
    res.json({ success: true, data: doctors });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const doctor = await doctorService.getDoctorById(req.params.id as string);
    res.json({ success: true, data: doctor });
  }),
};
