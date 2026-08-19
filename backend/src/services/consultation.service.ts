import { Consultation } from "../models/Consultation";
import { Doctor } from "../models/Doctor";
import { generatePaymentQrCode } from "../utils/qrCode";
import { ApiError } from "../utils/ApiError";
import type { CreateConsultationInput } from "../schemas/consultation.schema";

const CONSULTATION_FEE = 500;

export const consultationService = {
  async getPaymentQrCode(doctorId: string) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw ApiError.notFound("Doctor not found");
    const qrCodeImage = await generatePaymentQrCode(CONSULTATION_FEE, doctor.name);
    return { qrCodeImage, amount: CONSULTATION_FEE };
  },

  async createConsultation(patientId: string, input: CreateConsultationInput) {
    const doctor = await Doctor.findById(input.doctorId);
    if (!doctor) throw ApiError.notFound("Doctor not found");

    const consultation = await Consultation.create({
      doctor: input.doctorId,
      patient: patientId,
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

    return consultation;
  },

  async listForDoctor(doctorId: string) {
    return Consultation.find({ doctor: doctorId })
      .populate("patient", "-password")
      .sort({ createdAt: -1 });
  },

  async listForPatient(patientId: string) {
    return Consultation.find({ patient: patientId })
      .populate("doctor", "-password")
      .sort({ createdAt: -1 });
  },

  async getById(id: string) {
    const consultation = await Consultation.findById(id)
      .populate("patient", "-password")
      .populate("doctor", "-password");
    if (!consultation) throw ApiError.notFound("Consultation not found");
    return consultation;
  },
};
