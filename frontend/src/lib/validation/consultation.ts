import { z } from "zod";
import { requiredString } from "./common";

export const consultationStepOneSchema = z.object({
  currentIllnessHistory: requiredString("Current illness history", 3),
  hadRecentSurgery: z.boolean(),
  surgeryDetails: z.string().trim().optional(),
  surgeryTimeSpan: z.string().trim().optional(),
});
export type ConsultationStepOneValues = z.infer<typeof consultationStepOneSchema>;

export const consultationStepTwoSchema = z.object({
  diabetesStatus: z.enum(["diabetic", "non-diabetic"], { error: "Please select diabetic status" }),
  allergies: z.string().trim().optional(),
  others: z.string().trim().optional(),
});
export type ConsultationStepTwoValues = z.infer<typeof consultationStepTwoSchema>;

export const consultationStepThreeSchema = z.object({
  transactionId: requiredString("Transaction ID", 3),
});
export type ConsultationStepThreeValues = z.infer<typeof consultationStepThreeSchema>;
