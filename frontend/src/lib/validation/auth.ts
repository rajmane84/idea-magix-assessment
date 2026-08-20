import { z } from "zod";
import { requiredString, requiredNumber } from "./common";

const phoneRegex = /^[0-9+\-\s()]{7,15}$/;

const emailField = requiredString("Email").toLowerCase().pipe(z.email("Invalid email address"));
const phoneField = requiredString("Phone number").pipe(
  z.string().regex(phoneRegex, "Invalid phone number")
);

export const doctorSignUpSchema = z
  .object({
    name: requiredString("Name", 2),
    specialty: requiredString("Specialty", 2),
    email: emailField,
    phone: phoneField,
    yearsOfExperience: requiredNumber("Years of experience", (s) =>
      s.min(0, "Experience cannot be negative").max(80, "Please enter a valid value")
    ),
    password: requiredString("Password", 6, "Password must be at least 6 characters"),
    confirmPassword: requiredString("Confirm password"),
    profileImage: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type DoctorSignUpValues = z.infer<typeof doctorSignUpSchema>;

export const doctorSignInSchema = z.object({
  email: emailField,
  password: requiredString("Password"),
});
export type DoctorSignInValues = z.infer<typeof doctorSignInSchema>;

export const patientSignUpSchema = z
  .object({
    name: requiredString("Name", 2),
    age: requiredNumber("Age", (s) => s.int("Age must be a whole number").min(1).max(150)),
    email: emailField,
    phone: phoneField,
    surgeryHistory: z.string().trim().optional(),
    illnessHistory: z.string().trim().optional(),
    password: requiredString("Password", 6, "Password must be at least 6 characters"),
    confirmPassword: requiredString("Confirm password"),
    profileImage: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type PatientSignUpValues = z.infer<typeof patientSignUpSchema>;

export const patientSignInSchema = z.object({
  email: emailField,
  password: requiredString("Password"),
});
export type PatientSignInValues = z.infer<typeof patientSignInSchema>;

export const verifyOtpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;