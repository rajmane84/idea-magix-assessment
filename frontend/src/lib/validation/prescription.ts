import { z } from "zod";
import { requiredString } from "./common";

export const medicineSchema = z.object({
  name: requiredString("Medicine name"),
  dosage: z.string().trim().optional(),
  frequency: z.string().trim().optional(),
  duration: z.string().trim().optional(),
});

export const prescriptionFormSchema = z.object({
  careToBeTaken: requiredString("Care to be taken", 3),
  medicines: z.array(medicineSchema).optional(),
});
export type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;
