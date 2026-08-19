import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { consultationService } from "../services/consultation.service";
import { createConsultationSchema } from "../schemas/consultation.schema";
import { ApiError } from "../utils/ApiError";
import type { AuthenticatedRequest } from "../types";

export const consultationController = {
  getPaymentQrCode: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const data = await consultationService.getPaymentQrCode(req.params.doctorId as string);
    res.json({ success: true, data });
  }),

  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const input = createConsultationSchema.parse(req.body);
    const consultation = await consultationService.createConsultation(req.user.id, input);
    res.status(201).json({ success: true, message: "Consultation submitted successfully", data: consultation });
  }),

  listForDoctor: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const consultations = await consultationService.listForDoctor(req.user.id);
    res.json({ success: true, data: consultations });
  }),

  listForPatient: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const consultations = await consultationService.listForPatient(req.user.id);
    res.json({ success: true, data: consultations });
  }),

  getById: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const consultation = await consultationService.getById(req.params.id as string);
    res.json({ success: true, data: consultation });
  }),
};
