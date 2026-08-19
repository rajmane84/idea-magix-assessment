import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { generateOtp, hashOtp, compareOtp, OTP_TTL_MS } from "../utils/otp";
import { emailService } from "./email.service";
import { ApiError } from "../utils/ApiError";
import type { UserRole } from "../types";
import type {
  DoctorSignUpInput,
  DoctorSignInInput,
  PatientSignUpInput,
  PatientSignInInput,
} from "../schemas/auth.schema";

type VerifiableUser = InstanceType<typeof Doctor> | InstanceType<typeof Patient>;

/** Generates a fresh OTP, persists its hash on the user, and emails it. Signup/login stay usable even if the email send fails. */
async function issueOtp(user: VerifiableUser) {
  const code = generateOtp();
  user.otpCodeHash = await hashOtp(code);
  user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  await user.save();

  try {
    await emailService.sendOtpEmail(user.email, user.name, code);
  } catch (err) {
    console.error(`Failed to send OTP email to ${user.email}`, err);
  }
}

export const authService = {
  async registerDoctor(input: DoctorSignUpInput) {
    const existing = await Doctor.findOne({ $or: [{ email: input.email }, { phone: input.phone }] });
    if (existing) {
      throw ApiError.conflict(
        existing.email === input.email ? "Email is already registered" : "Phone number is already registered"
      );
    }

    const password = await hashPassword(input.password);
    const doctor = await Doctor.create({ ...input, password });
    await issueOtp(doctor);
    const token = signToken({ id: doctor.id, role: "doctor" });

    return { doctor: toSafeDoctor(doctor), token };
  },

  async loginDoctor(input: DoctorSignInInput) {
    const doctor = await Doctor.findOne({ email: input.email }).select("+password");
    if (!doctor) throw ApiError.unauthorized("Invalid email or password");

    const isValid = await comparePassword(input.password, doctor.password);
    if (!isValid) throw ApiError.unauthorized("Invalid email or password");

    const token = signToken({ id: doctor.id, role: "doctor" });
    return { doctor: toSafeDoctor(doctor), token };
  },

  async registerPatient(input: PatientSignUpInput) {
    const existing = await Patient.findOne({ $or: [{ email: input.email }, { phone: input.phone }] });
    if (existing) {
      throw ApiError.conflict(
        existing.email === input.email ? "Email is already registered" : "Phone number is already registered"
      );
    }

    const password = await hashPassword(input.password);
    const patient = await Patient.create({ ...input, password });
    await issueOtp(patient);
    const token = signToken({ id: patient.id, role: "patient" });

    return { patient: toSafePatient(patient), token };
  },

  async loginPatient(input: PatientSignInInput) {
    const patient = await Patient.findOne({ email: input.email }).select("+password");
    if (!patient) throw ApiError.unauthorized("Invalid email or password");

    const isValid = await comparePassword(input.password, patient.password);
    if (!isValid) throw ApiError.unauthorized("Invalid email or password");

    const token = signToken({ id: patient.id, role: "patient" });
    return { patient: toSafePatient(patient), token };
  },

  async verifyOtp(role: UserRole, userId: string, code: string) {
    const user =
      role === "doctor"
        ? await Doctor.findById(userId).select("+otpCodeHash +otpExpiresAt")
        : await Patient.findById(userId).select("+otpCodeHash +otpExpiresAt");
    if (!user) throw ApiError.notFound("Account not found");
    if (user.isVerified) throw ApiError.badRequest("Account is already verified");
    if (!user.otpCodeHash || !user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) {
      throw ApiError.badRequest("This code has expired. Please request a new one.");
    }

    const isValid = await compareOtp(code, user.otpCodeHash);
    if (!isValid) throw ApiError.badRequest("Invalid verification code");

    user.isVerified = true;
    user.otpCodeHash = null;
    user.otpExpiresAt = null;
    await user.save();

    return role === "doctor"
      ? toSafeDoctor(user as InstanceType<typeof Doctor>)
      : toSafePatient(user as InstanceType<typeof Patient>);
  },

  async resendOtp(role: UserRole, userId: string) {
    const user = role === "doctor" ? await Doctor.findById(userId) : await Patient.findById(userId);
    if (!user) throw ApiError.notFound("Account not found");
    if (user.isVerified) throw ApiError.badRequest("Account is already verified");

    await issueOtp(user);
  },
};

function toSafeDoctor(doctor: InstanceType<typeof Doctor>) {
  const { password, otpCodeHash, otpExpiresAt, ...safe } = doctor.toObject();
  return safe;
}

function toSafePatient(patient: InstanceType<typeof Patient>) {
  const { password, otpCodeHash, otpExpiresAt, ...safe } = patient.toObject();
  return safe;
}
