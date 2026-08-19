import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prescriptionService } from "../services/prescription.service";
import { createPrescriptionSchema, updatePrescriptionSchema } from "../schemas/prescription.schema";
import { ApiError } from "../utils/ApiError";
import type { AuthenticatedRequest } from "../types";

export const createPrescription = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = createPrescriptionSchema.parse(req.body);
  const prescription = await prescriptionService.create(req.user.id, input);
  res.status(201).json({ success: true, message: "Prescription created", data: prescription });
});

export const updatePrescription = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = updatePrescriptionSchema.parse(req.body);
  const prescription = await prescriptionService.update(req.user.id, req.params.id as string, input);
  res.json({ success: true, message: "Prescription updated", data: prescription });
});

export const sendPrescription = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const prescription = await prescriptionService.send(req.user.id, req.params.id as string);
  res.json({ success: true, message: "Prescription sent to patient", data: prescription });
});

export const getPrescriptionByConsultation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const prescription = await prescriptionService.getByConsultation(req.params.consultationId as string);
  res.json({ success: true, data: prescription });
});

export const listPrescriptionsForPatient = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const prescriptions = await prescriptionService.listForPatient(req.user.id);
  res.json({ success: true, data: prescriptions });
});

export const getPrescriptionById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const prescription = await prescriptionService.getById(req.params.id as string);
  res.json({ success: true, data: prescription });
});
