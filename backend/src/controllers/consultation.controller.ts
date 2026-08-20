import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { createConsultationSchema } from "../schemas/consultation.schema";
import { Consultation } from "../models/Consultation";
import { Doctor } from "../models/Doctor";
import { generatePaymentQrCode } from "../utils/qrCode";
import type { AuthenticatedRequest } from "../types";
import { CONSULTATION_FEE, MAX_CONSULTATIONS_PER_PATIENT_PER_DAY } from '../constants'
import { paginationQuerySchema } from "../schemas/shared.schema";
import mongoose from "mongoose";

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

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const consultationsToday = await Consultation.countDocuments({
    patient: user.id,
    createdAt: { $gte: startOfDay },
  });

  if (consultationsToday >= MAX_CONSULTATIONS_PER_PATIENT_PER_DAY) {
    throw new Error(`You can only submit up to ${MAX_CONSULTATIONS_PER_PATIENT_PER_DAY} consultations per day`);
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

  const parsed = paginationQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw parsed.error;
  }

  const { page, limit, skip } = parsed.data;

  const filter = { doctor: user.id };

  const [consultations, total] = await Promise.all([
    Consultation.find(filter)
      .populate("patient")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Consultation.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: consultations,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const listConsultationsForPatient = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  const parsed = paginationQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw parsed.error;
  }

  const { page, limit, skip } = parsed.data;

  const filter = { patient: user.id };

  const [consultations, total] = await Promise.all([
    Consultation.find(filter)
      .populate("doctor")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Consultation.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: consultations,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const getConsultationById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {id} = req.params;
  
  if (!mongoose.isValidObjectId(id as string)) {
    throw new Error("Invalid consultation ID");
  }

  const consultation = await Consultation.findById(id as string)
    .populate("patient")
    .populate("doctor");

  if (!consultation) {
    throw new Error("Consultation not found");
  }

  res.status(200).json({ success: true, data: consultation });
});
