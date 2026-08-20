import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  doctorSignInSchema,
  doctorSignUpSchema,
  patientSignInSchema,
  patientSignUpSchema,
  verifyOtpSchema,
} from "../schemas/auth.schema";
import { COOKIE_OPTIONS, MAX_OTP_ATTEMPTS, OTP_RESEND_COOLDOWN_MS } from "../constants";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { generateOtp, hashOtp, compareOtp, OTP_TTL_MS } from "../utils/otp";
import { emailService } from "../services/email.service";
import type { AuthenticatedRequest } from "../types";

type VerifiableUser = InstanceType<typeof Doctor> | InstanceType<typeof Patient>;

async function issueOtp(user: VerifiableUser) {
  const code = generateOtp();
  user.otpCodeHash = await hashOtp(code);
  user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  user.otpAttempts = 0;
  await user.save();

  try {
    await emailService.sendOtpEmail(user.email, user.name, code);
  } catch (err) {
    console.error(`Failed to send OTP email to ${user.email}`, err);
  }
}

export const registerDoctor = asyncHandler(async (req: Request, res: Response) => {
  const parsed = doctorSignUpSchema.safeParse(req.body);

  if (!parsed.success) {
    throw parsed.error;
  }

  const { email, name, password, phone, specialty, yearsOfExperience, profileImage } = parsed.data;

  const existing = await Doctor.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    throw new Error(
      existing.email === email ? "Email is already registered" : "Phone number is already registered"
    );
  }

    const doctor = await Doctor.create({
      email,
      name,
      password,
      phone,
      specialty,
      yearsOfExperience,
      profileImage,
    });

  await issueOtp(doctor);
  const token = generateToken({ id: doctor.id, role: "doctor" });

  res.cookie("token", token, COOKIE_OPTIONS);
  res.status(201).json({ success: true, message: "Account created successfully", data: { doctor } });
})

export const loginDoctor = asyncHandler(async (req: Request, res: Response) => {
  const parsed = doctorSignInSchema.safeParse(req.body);

  if (!parsed.success) {
    throw parsed.error;
  }

  const { email, password } = parsed.data;

  const doctor = await Doctor.findOne({ email }).select("+password");
  if (!doctor) {
    throw new Error("Invalid Email or Password")
  }

  const isValid = await comparePassword(password, doctor.password);
  if (!isValid) {
    throw new Error("Invalid Email or Password")
  }

  const token = generateToken({ id: doctor.id, role: "doctor" });

  res.cookie("token", token, COOKIE_OPTIONS);
  res.status(200).json({ success: true, message: "Logged in successfully", data: { doctor } });
});

export const registerPatient = asyncHandler(async (req: Request, res: Response) => {
  const parsed = patientSignUpSchema.safeParse(req.body);

  if (!parsed.success) {
    throw parsed.error;
  }

  const { age, email, illnessHistory, name, password, phone, surgeryHistory, profileImage } = parsed.data;

  const existing = await Patient.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    throw new Error(
      existing.email === email ? "Email is already registered" : "Phone number is already registered"
    );
  }

  const patient = await Patient.create({
      email,
      age,
      illnessHistory,
      surgeryHistory,
      name,
      password,
      phone,
      profileImage,
    });

  await issueOtp(patient);
  const token = generateToken({ id: patient.id, role: "patient" });

  res.cookie("token", token, COOKIE_OPTIONS);
  res.status(201).json({ success: true, message: "Account created successfully", data: { patient } });
});

export const loginPatient = asyncHandler(async (req: Request, res: Response) => {
  const parsed = patientSignInSchema.safeParse(req.body);

  if (!parsed.success) {
    throw parsed.error;
  }

  const { email, password } = parsed.data;

  const patient = await Patient.findOne({ email }).select("+password");
  if (!patient) {
    throw new Error("Invalid Email or Password")
  }

  const isValid = await comparePassword(password, patient.password);
  if (!isValid) {
    throw new Error("Invalid Email or Password")
  }

  const token = generateToken({ id: patient.id, role: "patient" });

  res.cookie("token", token, COOKIE_OPTIONS);
  res.status(200).json({ success: true, message: "Logged in successfully", data: { patient } });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  if (user.role === "doctor") {
    const doctor = await Doctor.findById(user.id);
    if (!doctor) throw new Error("Doctor not found");
    return res.status(200).json({ success: true, data: { role: "doctor", doctor } });
  }
  const patient = await Patient.findById(user.id);
  if (!patient) throw new Error("Patient not found");
  res.status(200).json({ success: true, data: { role: "patient", patient } });
});

export const verifyOtp = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const parsed = verifyOtpSchema.safeParse(req.body);

  if (!parsed.success) {
    throw parsed.error;
  }

  const {code} = parsed.data;

  const account =
    user.role === "doctor"
      ? await Doctor.findById(user.id).select("+otpCodeHash +otpExpiresAt +otpAttempts")
      : await Patient.findById(user.id).select("+otpCodeHash +otpExpiresAt +otpAttempts");

  if (!account) {
    throw new Error("Account not found")
  }

  if (account.isVerified) {
    throw new Error("Account is already verified")
  }
  if (!account.otpCodeHash || account.isOtpExpired()) {
    throw new Error("This code has expired. Please request a new one.");
  }

  if (account.otpAttempts >= MAX_OTP_ATTEMPTS) {
    throw new Error("Too many incorrect attempts. Please request a new code.");
  }

  const isValid = await compareOtp(code, account.otpCodeHash);
  if (!isValid) {
    account.otpAttempts += 1;
    await account.save();
    throw new Error("Invalid verification code");
  }

  account.isVerified = true;
  account.otpCodeHash = null;
  account.otpExpiresAt = null;
  account.otpAttempts = 0;
  await account.save();

  res.status(200).json({
    success: true,
    message: "Account verified successfully",
    data: user.role === "doctor" ? { doctor: account } : { patient: account },
  });
});

export const resendOtp = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  const account =
    user.role === "doctor"
      ? await Doctor.findById(user.id).select("+otpExpiresAt")
      : await Patient.findById(user.id).select("+otpExpiresAt");
  if (!account) {
    throw new Error("Account not found")
  }
  if (account.isVerified) {
    throw new Error("Account is already verified");
  }

  if (account.otpExpiresAt) {
    const issuedAt = account.otpExpiresAt.getTime() - OTP_TTL_MS;
    const nextAllowedAt = issuedAt + OTP_RESEND_COOLDOWN_MS;
    if (Date.now() < nextAllowedAt) {
      const waitSeconds = Math.ceil((nextAllowedAt - Date.now()) / 1000);
      throw new Error(`Please wait ${waitSeconds}s before requesting another code`);
    }
  }

  await issueOtp(account);
  res.status(200).json({ success: true, message: "A new verification code has been sent to your email" });
});
