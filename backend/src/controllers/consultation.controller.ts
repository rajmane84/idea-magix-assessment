import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { consultationService } from "../services/consultation.service";
import { createConsultationSchema } from "../schemas/consultation.schema";
import { ApiError } from "../utils/ApiError";
import type { AuthenticatedRequest } from "../types";

export const getConsultationPaymentQr = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await consultationService.getPaymentQrCode(req.params.doctorId as string);
  res.json({ success: true, data });
});

export const createConsultation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = createConsultationSchema.parse(req.body);
  const consultation = await consultationService.createConsultation(req.user.id, input);
  res.status(201).json({ success: true, message: "Consultation submitted successfully", data: consultation });
});

export const listConsultationsForDoctor = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const consultations = await consultationService.listForDoctor(req.user.id);
  res.json({ success: true, data: consultations });
});

export const listConsultationsForPatient = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const consultations = await consultationService.listForPatient(req.user.id);
  res.json({ success: true, data: consultations });
});

export const getConsultationById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const consultation = await consultationService.getById(req.params.id as string);
  res.json({ success: true, data: consultation });
});
