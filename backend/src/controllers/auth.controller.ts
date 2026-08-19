import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authService } from "../services/auth.service";
import {
  doctorSignInSchema,
  doctorSignUpSchema,
  patientSignInSchema,
  patientSignUpSchema,
  verifyOtpSchema,
} from "../schemas/auth.schema";
import { COOKIE_OPTIONS } from "../constants";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { ApiError } from "../utils/ApiError";
import type { AuthenticatedRequest, AuthTokenPayload } from "../types";

/** Narrows `req.user` from optional to required, for handlers mounted behind `requireAuth()`. */
function requireUser(req: AuthenticatedRequest): AuthTokenPayload {
  if (!req.user) throw ApiError.unauthorized();
  return req.user;
}

export const registerDoctor = asyncHandler(async (req: Request, res: Response) => {
  const input = doctorSignUpSchema.parse(req.body);
  const { doctor, token } = await authService.registerDoctor(input);
  res.cookie("token", token, COOKIE_OPTIONS);
  res.status(201).json({ success: true, message: "Account created successfully", data: { doctor, token } });
});

export const loginDoctor = asyncHandler(async (req: Request, res: Response) => {
  const input = doctorSignInSchema.parse(req.body);
  const { doctor, token } = await authService.loginDoctor(input);
  res.cookie("token", token, COOKIE_OPTIONS);
  res.json({ success: true, message: "Logged in successfully", data: { doctor, token } });
});

export const registerPatient = asyncHandler(async (req: Request, res: Response) => {
  const input = patientSignUpSchema.parse(req.body);
  const { patient, token } = await authService.registerPatient(input);
  res.cookie("token", token, COOKIE_OPTIONS);
  res.status(201).json({ success: true, message: "Account created successfully", data: { patient, token } });
});

export const loginPatient = asyncHandler(async (req: Request, res: Response) => {
  const input = patientSignInSchema.parse(req.body);
  const { patient, token } = await authService.loginPatient(input);
  res.cookie("token", token, COOKIE_OPTIONS);
  res.json({ success: true, message: "Logged in successfully", data: { patient, token } });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // Must pass the same attributes the cookie was set with (path/sameSite/secure) -
  // browsers won't clear a cookie whose scoping attributes don't match.
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ success: true, message: "Logged out successfully" });
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = requireUser(req);
  if (user.role === "doctor") {
    const doctor = await Doctor.findById(user.id);
    if (!doctor) throw ApiError.notFound("Doctor not found");
    return res.json({ success: true, data: { role: "doctor", doctor } });
  }
  const patient = await Patient.findById(user.id);
  if (!patient) throw ApiError.notFound("Patient not found");
  res.json({ success: true, data: { role: "patient", patient } });
});

export const verifyOtp = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = requireUser(req);
  const { code } = verifyOtpSchema.parse(req.body);
  const verifiedUser = await authService.verifyOtp(user.role, user.id, code);
  res.json({ success: true, message: "Account verified successfully", data: { [user.role]: verifiedUser } });
});

export const resendOtp = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = requireUser(req);
  await authService.resendOtp(user.role, user.id);
  res.json({ success: true, message: "A new verification code has been sent to your email" });
});
