import { z } from "zod";

const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
const email = z.string().trim().toLowerCase().pipe(z.email("Invalid email address"));

export const doctorSignUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  specialty: z.string().trim().min(2, "Specialty is required"),
  email,
  phone: z.string().trim().regex(phoneRegex, "Invalid phone number"),
  yearsOfExperience: z.coerce
    .number()
    .min(0, "Experience cannot be negative")
    .max(150, "Please enter a valid value"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  profileImage: z.string().trim().optional().default(""),
});

export const doctorSignInSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const patientSignUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  age: z.coerce
    .number()
    .int("Age must be a whole number")
    .min(0, "Age cannot be negative")
    .max(150, "Please enter a valid age"),
  email,
  phone: z.string().trim().regex(phoneRegex, "Invalid phone number"),
  surgeryHistory: z.string().trim().optional().default(""),
  // Comma separated string coming from the form, split into an array.
  illnessHistory: z
    .string()
    .optional()
    .default("")
    .transform((val) =>
      val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
  profileImage: z.string().trim().optional().default(""),
});

export const patientSignInSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const verifyOtpSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export type DoctorSignUpInput = z.infer<typeof doctorSignUpSchema>;
export type DoctorSignInInput = z.infer<typeof doctorSignInSchema>;
export type PatientSignUpInput = z.infer<typeof patientSignUpSchema>;
export type PatientSignInInput = z.infer<typeof patientSignInSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
