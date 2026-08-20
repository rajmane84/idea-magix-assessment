import mongoose from "mongoose";
import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
} from "../schemas/prescription.schema";
import { paginationQuerySchema } from "../schemas/shared.schema";
import { Prescription } from "../models/Prescription";
import { Consultation } from "../models/Consultation";
import { generatePrescriptionPdf } from "../utils/pdfGenerator";
import { cloudinaryService } from "../services/cloudinary.service";
import type { AuthenticatedRequest } from "../types";

/** Renders the prescription PDF, uploads it to Cloudinary, and cleans up the previous PDF (if any) once the new one is safely saved. */
async function buildAndSavePdf(prescriptionId: string) {
  const prescription = await Prescription.findById(prescriptionId)
    .populate("doctor", "name specialty yearsOfExperience")
    .populate("patient", "name age");
  if (!prescription) {
    throw new Error("Prescription not found");
  }

  const doctor = prescription.doctor as unknown as { name: string; specialty: string; yearsOfExperience: number };
  const patient = prescription.patient as unknown as { name: string; age: number };
  const previousPdfPublicId = prescription.pdfPublicId;

  const pdfBuffer = await generatePrescriptionPdf({
    doctor,
    patient,
    careToBeTaken: prescription.careToBeTaken,
    medicines: prescription.medicines,
    createdAt: prescription.createdAt ?? new Date(),
  });

  const { url, publicId } = await cloudinaryService.addPrescriptionPdf(pdfBuffer);

  prescription.pdfPath = url;
  prescription.pdfPublicId = publicId;
  await prescription.save();

  if (previousPdfPublicId) await cloudinaryService.deletePrescriptionPdf(previousPdfPublicId);

  return prescription;
}

export const createPrescription = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const parsed = createPrescriptionSchema.safeParse(req.body);

  if (!parsed.success) {
    throw parsed.error;
  }

  const input = parsed.data;

  if (!mongoose.isValidObjectId(input.consultationId)) {
    throw new Error("Invalid consultation ID");
  }

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
    sentToPatient: false,
    sentAt: null,
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

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid prescription ID");
  }

  const existing = await Prescription.findById(id as string);
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
  const { id } = req.params;
  const user = req.user!;

  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid prescription ID");
  }

  const prescription = await Prescription.findById(id);
  if (!prescription) {
    throw new Error("Prescription not found");
  }

  if (prescription.doctor.toString() !== user.id) {
    throw new Error("You cannot send this prescription");
  }

  if (!prescription.careToBeTaken?.trim()) {
    throw new Error("Cannot send an incomplete prescription");
  }

  // Ensure PDF is generated and uploaded before sending
  if (!prescription.pdfPath) {
    await buildAndSavePdf(prescription.id);
  }

  prescription.sentToPatient = true;
  prescription.sentAt = new Date();
  await prescription.save();

  // Sync consultation status
  await Consultation.findByIdAndUpdate(prescription.consultation, { status: "prescribed" });

  res.status(200).json({ success: true, message: "Prescription sent to patient", data: prescription });
});

export const getPrescriptionByConsultation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { consultationId } = req.params;
  const user = req.user!;

  if (!mongoose.isValidObjectId(consultationId)) {
    throw new Error("Invalid consultation ID");
  }

  const consultation = await Consultation.findById(consultationId);
  if (!consultation) {
    throw new Error("Consultation not found");
  }

  const prescription = await Prescription.findOne({ consultation: consultationId })
    .populate("doctor")
    .populate("patient")
    .populate("consultation");

  if (!prescription) {
    return res.status(200).json({ success: true, data: null });
  }

  // Patients can only view prescriptions that have been finalized and sent
  const isPatient = consultation.patient.toString() === user.id;
  
  if (isPatient && !prescription.sentToPatient) {
    return res.status(200).json({ success: true, data: null });
  }

  res.status(200).json({ success: true, data: prescription });
});

export const listPrescriptionsForPatient = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  const parsed = paginationQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw parsed.error;
  }

  const { page, limit, skip } = parsed.data;

  const filter = { patient: user.id, sentToPatient: true };

  const [prescriptions, total] = await Promise.all([
    Prescription.find(filter)
      .populate("doctor")
      .populate("consultation")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Prescription.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: prescriptions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const getPrescriptionById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id as string)) {
    throw new Error("Invalid prescription ID");
  }

  const prescription = await Prescription.findById(id as string)
    .populate("doctor")
    .populate("patient")
    .populate("consultation");

  if (!prescription) {
    throw new Error("Prescription not found");
  }

  res.status(200).json({ success: true, data: prescription });
});
