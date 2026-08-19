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
import { env } from "../config/env";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { ApiError } from "../utils/ApiError";
import type { AuthenticatedRequest } from "../types";

const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const authController = {
  registerDoctor: asyncHandler(async (req: Request, res: Response) => {
    const input = doctorSignUpSchema.parse(req.body);
    const { doctor, token } = await authService.registerDoctor(input);
    res.cookie("token", token, cookieOptions);
    res.status(201).json({ success: true, message: "Account created successfully", data: { doctor, token } });
  }),

  loginDoctor: asyncHandler(async (req: Request, res: Response) => {
    const input = doctorSignInSchema.parse(req.body);
    const { doctor, token } = await authService.loginDoctor(input);
    res.cookie("token", token, cookieOptions);
    res.json({ success: true, message: "Logged in successfully", data: { doctor, token } });
  }),

  registerPatient: asyncHandler(async (req: Request, res: Response) => {
    const input = patientSignUpSchema.parse(req.body);
    const { patient, token } = await authService.registerPatient(input);
    res.cookie("token", token, cookieOptions);
    res.status(201).json({ success: true, message: "Account created successfully", data: { patient, token } });
  }),

  loginPatient: asyncHandler(async (req: Request, res: Response) => {
    const input = patientSignInSchema.parse(req.body);
    const { patient, token } = await authService.loginPatient(input);
    res.cookie("token", token, cookieOptions);
    res.json({ success: true, message: "Logged in successfully", data: { patient, token } });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out successfully" });
  }),

  me: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findById(req.user.id);
      if (!doctor) throw ApiError.notFound("Doctor not found");
      return res.json({ success: true, data: { role: "doctor", doctor } });
    }
    const patient = await Patient.findById(req.user.id);
    if (!patient) throw ApiError.notFound("Patient not found");
    res.json({ success: true, data: { role: "patient", patient } });
  }),

  verifyOtp: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const { code } = verifyOtpSchema.parse(req.body);
    const user = await authService.verifyOtp(req.user.role, req.user.id, code);
    res.json({ success: true, message: "Account verified successfully", data: { [req.user.role]: user } });
  }),

  resendOtp: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    await authService.resendOtp(req.user.role, req.user.id);
    res.json({ success: true, message: "A new verification code has been sent to your email" });
  }),
};
