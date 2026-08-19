import { z } from "zod";

const medicineSchema = z.object({
  name: z.string().trim().min(1, "Medicine name is required"),
  dosage: z.string().trim().optional().default(""),
  frequency: z.string().trim().optional().default(""),
  duration: z.string().trim().optional().default(""),
});

export const createPrescriptionSchema = z.object({
  consultationId: z.string().trim().min(1, "Consultation is required"),
  careToBeTaken: z.string().trim().min(3, "Please describe the care to be taken"),
  medicines: z.array(medicineSchema).optional().default([]),
});

export const updatePrescriptionSchema = z.object({
  careToBeTaken: z.string().trim().min(3, "Please describe the care to be taken"),
  medicines: z.array(medicineSchema).optional().default([]),
});

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
export type UpdatePrescriptionInput = z.infer<typeof updatePrescriptionSchema>;
