import { Prescription } from "../models/Prescription";
import { Consultation } from "../models/Consultation";
import { generatePrescriptionPdf } from "../utils/pdfGenerator";
import { ApiError } from "../utils/ApiError";
import type { CreatePrescriptionInput, UpdatePrescriptionInput } from "../schemas/prescription.schema";

async function buildAndSavePdf(prescriptionId: string) {
  const prescription = await Prescription.findById(prescriptionId)
    .populate("doctor", "name specialty yearsOfExperience")
    .populate("patient", "name age");
  if (!prescription) throw ApiError.notFound("Prescription not found");

  const doctor = prescription.doctor as unknown as { name: string; specialty: string; yearsOfExperience: number };
  const patient = prescription.patient as unknown as { name: string; age: number };

  const pdfPath = await generatePrescriptionPdf({
    doctor,
    patient,
    careToBeTaken: prescription.careToBeTaken,
    medicines: prescription.medicines,
    createdAt: prescription.createdAt ?? new Date(),
  });

  prescription.pdfPath = pdfPath;
  await prescription.save();
  return prescription;
}

export const prescriptionService = {
  async create(doctorId: string, input: CreatePrescriptionInput) {
    const consultation = await Consultation.findById(input.consultationId);
    if (!consultation) throw ApiError.notFound("Consultation not found");
    if (consultation.doctor.toString() !== doctorId) {
      throw ApiError.forbidden("You cannot prescribe for this consultation");
    }

    const existing = await Prescription.findOne({ consultation: input.consultationId });
    if (existing) throw ApiError.conflict("A prescription already exists for this consultation. Please edit it instead.");

    const prescription = await Prescription.create({
      consultation: input.consultationId,
      doctor: doctorId,
      patient: consultation.patient,
      careToBeTaken: input.careToBeTaken,
      medicines: input.medicines,
    });

    consultation.status = "prescribed";
    await consultation.save();

    return buildAndSavePdf(prescription.id);
  },

  async update(doctorId: string, prescriptionId: string, input: UpdatePrescriptionInput) {
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) throw ApiError.notFound("Prescription not found");
    if (prescription.doctor.toString() !== doctorId) {
      throw ApiError.forbidden("You cannot edit this prescription");
    }

    prescription.careToBeTaken = input.careToBeTaken;
    prescription.medicines = input.medicines as typeof prescription.medicines;
    // Editing invalidates the previous "sent" state until the doctor resends it.
    prescription.sentToPatient = false;
    prescription.sentAt = null;
    await prescription.save();

    return buildAndSavePdf(prescription.id);
  },

  async send(doctorId: string, prescriptionId: string) {
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) throw ApiError.notFound("Prescription not found");
    if (prescription.doctor.toString() !== doctorId) {
      throw ApiError.forbidden("You cannot send this prescription");
    }

    prescription.sentToPatient = true;
    prescription.sentAt = new Date();
    await prescription.save();
    return prescription;
  },

  async getByConsultation(consultationId: string) {
    return Prescription.findOne({ consultation: consultationId });
  },

  async listForPatient(patientId: string) {
    return Prescription.find({ patient: patientId, sentToPatient: true })
      .populate("doctor", "-password")
      .populate("consultation")
      .sort({ createdAt: -1 });
  },

  async getById(prescriptionId: string) {
    const prescription = await Prescription.findById(prescriptionId)
      .populate("doctor", "-password")
      .populate("patient", "-password")
      .populate("consultation");
    if (!prescription) throw ApiError.notFound("Prescription not found");
    return prescription;
  },
};
