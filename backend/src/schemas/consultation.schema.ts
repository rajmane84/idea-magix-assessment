import { z } from "zod";

export const consultationStepOneSchema = z.object({
  currentIllnessHistory: z.string().trim().min(3, "Please describe the current illness"),
  hadRecentSurgery: z.boolean().default(false),
  surgeryDetails: z.string().trim().optional().default(""),
  surgeryTimeSpan: z.string().trim().optional().default(""),
});

export const consultationStepTwoSchema = z.object({
  diabetesStatus: z.enum(["diabetic", "non-diabetic"], {
    error: "Please select an option",
  }),
  allergies: z.string().trim().optional().default(""),
  others: z.string().trim().optional().default(""),
});

export const consultationStepThreeSchema = z.object({
  transactionId: z.string().trim().min(3, "Transaction ID is required"),
});

export const createConsultationSchema = z.object({
  doctorId: z.string().trim().min(1, "Doctor is required"),
  ...consultationStepOneSchema.shape,
  ...consultationStepTwoSchema.shape,
  ...consultationStepThreeSchema.shape,
});

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;
