import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { createConsultationSchema } from "../schemas/consultation.schema";
import { Consultation } from "../models/Consultation";
import { Doctor } from "../models/Doctor";
import { generatePaymentQrCode } from "../utils/qrCode";
import type { AuthenticatedRequest } from "../types";
import {CONSULTATION_FEE } from '../constants'

export const getConsultationPaymentQr = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const doctor = await Doctor.findById(req.params.doctorId);
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const qrCodeImage = await generatePaymentQrCode(CONSULTATION_FEE, doctor.name);
  res.status(200).json({ success: true, data: { qrCodeImage, amount: CONSULTATION_FEE } });
});

export const createConsultation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const parsed = createConsultationSchema.safeParse(req.body);

  if (!parsed.success) {
    throw parsed.error;
  }

  const input = parsed.data;

  const doctor = await Doctor.findById(input.doctorId);
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const consultation = await Consultation.create({
    doctor: input.doctorId,
    patient: user.id,
    currentIllnessHistory: input.currentIllnessHistory,
    recentSurgery: {
      hadSurgery: input.hadRecentSurgery,
      details: input.surgeryDetails,
      timeSpan: input.surgeryTimeSpan,
    },
    familyMedicalHistory: {
      diabetesStatus: input.diabetesStatus,
      allergies: input.allergies,
      others: input.others,
    },
    payment: {
      transactionId: input.transactionId,
      amount: CONSULTATION_FEE,
    },
  });

  res.status(201).json({ success: true, message: "Consultation submitted successfully", data: consultation });
});

export const listConsultationsForDoctor = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  const consultations = await Consultation.find({ doctor: user.id })
    .populate("patient", "-password")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: consultations });
});

export const listConsultationsForPatient = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  const consultations = await Consultation.find({ patient: user.id })
    .populate("doctor", "-password")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: consultations });
});

export const getConsultationById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const consultation = await Consultation.findById(req.params.id)
    .populate("patient")
    .populate("doctor");

  if (!consultation) {
    throw new Error("Consultation not found");
  }

  res.status(200).json({ success: true, data: consultation });
});
