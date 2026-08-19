import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { createPrescriptionSchema, updatePrescriptionSchema } from "../schemas/prescription.schema";
import { Prescription } from "../models/Prescription";
import { Consultation } from "../models/Consultation";
import { generatePrescriptionPdf, deletePrescriptionPdf } from "../utils/pdfGenerator";
import type { AuthenticatedRequest } from "../types";

/** Renders the prescription PDF, saves its path, and cleans up the previous PDF (if any) once the new one is safely saved. */
async function buildAndSavePdf(prescriptionId: string) {
  const prescription = await Prescription.findById(prescriptionId)
    .populate("doctor", "name specialty yearsOfExperience")
    .populate("patient", "name age");
  if (!prescription) {
    throw new Error("Prescription not found");
  }

  const doctor = prescription.doctor as unknown as { name: string; specialty: string; yearsOfExperience: number };
  const patient = prescription.patient as unknown as { name: string; age: number };
  const previousPdfPath = prescription.pdfPath;

  const pdfPath = await generatePrescriptionPdf({
    doctor,
    patient,
    careToBeTaken: prescription.careToBeTaken,
    medicines: prescription.medicines,
    createdAt: prescription.createdAt ?? new Date(),
  });

  prescription.pdfPath = pdfPath;
  await prescription.save();

  if (previousPdfPath) await deletePrescriptionPdf(previousPdfPath);

  return prescription;
}

export const createPrescription = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const parsed = createPrescriptionSchema.safeParse(req.body);

  if (!parsed.success) {
    throw parsed.error;
  }

  const input = parsed.data;

  const consultation = await Consultation.findById(input.consultationId);
  if (!consultation) {
    throw new Error("Consultation not found");
  }
  if (consultation.doctor.toString() !== user.id) {
    throw new Error("You cannot prescribe for this consultation");
  }

  const existing = await Prescription.findOne({ consultation: input.consultationId });
  if (existing) {
    throw new Error("A prescription already exists for this consultation. Please edit it instead.");
  }

  const created = await Prescription.create({
    consultation: input.consultationId,
    doctor: user.id,
    patient: consultation.patient,
    careToBeTaken: input.careToBeTaken,
    medicines: input.medicines,
  });

  consultation.status = "prescribed";
  await consultation.save();

  const prescription = await buildAndSavePdf(created.id);

  res.status(201).json({ success: true, message: "Prescription created", data: prescription });
});

export const updatePrescription = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const parsed = updatePrescriptionSchema.safeParse(req.body);

  if (!parsed.success) {
    throw parsed.error;
  }

  const input = parsed.data;

  const existing = await Prescription.findById(req.params.id);
  if (!existing) {
    throw new Error("Prescription not found");
  }
  if (existing.doctor.toString() !== user.id) {
    throw new Error("You cannot edit this prescription");
  }

  existing.careToBeTaken = input.careToBeTaken;
  existing.medicines = input.medicines as typeof existing.medicines;
  existing.sentToPatient = false;
  existing.sentAt = null;
  await existing.save();

  const prescription = await buildAndSavePdf(existing.id);

  res.status(200).json({ success: true, message: "Prescription updated", data: prescription });
});

export const sendPrescription = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) {
    throw new Error("Prescription not found");
  }
  if (prescription.doctor.toString() !== user.id) {
    throw new Error("You cannot send this prescription");
  }

  prescription.sentToPatient = true;
  prescription.sentAt = new Date();
  await prescription.save();

  res.status(200).json({ success: true, message: "Prescription sent to patient", data: prescription });
});

export const getPrescriptionByConsultation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const prescription = await Prescription.findOne({ consultation: req.params.consultationId });
  res.status(200).json({ success: true, data: prescription });
});

export const listPrescriptionsForPatient = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  const prescriptions = await Prescription.find({ patient: user.id, sentToPatient: true })
    .populate("doctor", "-password")
    .populate("consultation")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: prescriptions });
});

export const getPrescriptionById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate("doctor", "-password")
    .populate("patient", "-password")
    .populate("consultation");

  if (!prescription) {
    throw new Error("Prescription not found");
  }

  res.status(200).json({ success: true, data: prescription });
});
