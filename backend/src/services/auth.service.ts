import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { comparePassword } from "../utils/password";
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

const MAX_OTP_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

/** Generates a fresh OTP, persists its hash on the user, and emails it. Signup/login stay usable even if the email send fails. */
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

export const authService = {
  async registerDoctor(input: DoctorSignUpInput) {
    const existing = await Doctor.findOne({ $or: [{ email: input.email }, { phone: input.phone }] });
    if (existing) {
      throw ApiError.conflict(
        existing.email === input.email ? "Email is already registered" : "Phone number is already registered"
      );
    }

    const doctor = await Doctor.create(input);
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

    const patient = await Patient.create(input);
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
        ? await Doctor.findById(userId).select("+otpCodeHash +otpExpiresAt +otpAttempts")
        : await Patient.findById(userId).select("+otpCodeHash +otpExpiresAt +otpAttempts");
    if (!user) throw ApiError.notFound("Account not found");
    if (user.isVerified) throw ApiError.badRequest("Account is already verified");
    if (!user.otpCodeHash || !user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) {
      throw ApiError.badRequest("This code has expired. Please request a new one.");
    }
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      throw ApiError.badRequest("Too many incorrect attempts. Please request a new code.");
    }

    const isValid = await compareOtp(code, user.otpCodeHash);
    if (!isValid) {
      user.otpAttempts += 1;
      await user.save();
      throw ApiError.badRequest("Invalid verification code");
    }

    user.isVerified = true;
    user.otpCodeHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();

    return role === "doctor"
      ? toSafeDoctor(user as InstanceType<typeof Doctor>)
      : toSafePatient(user as InstanceType<typeof Patient>);
  },

  async resendOtp(role: UserRole, userId: string) {
    const user =
      role === "doctor"
        ? await Doctor.findById(userId).select("+otpExpiresAt")
        : await Patient.findById(userId).select("+otpExpiresAt");
    if (!user) throw ApiError.notFound("Account not found");
    if (user.isVerified) throw ApiError.badRequest("Account is already verified");

    if (user.otpExpiresAt) {
      const issuedAt = user.otpExpiresAt.getTime() - OTP_TTL_MS;
      const nextAllowedAt = issuedAt + OTP_RESEND_COOLDOWN_MS;
      if (Date.now() < nextAllowedAt) {
        const waitSeconds = Math.ceil((nextAllowedAt - Date.now()) / 1000);
        throw ApiError.badRequest(`Please wait ${waitSeconds}s before requesting another code`);
      }
    }

    await issueOtp(user);
  },
};

function toSafeDoctor(doctor: InstanceType<typeof Doctor>) {
  const { password, otpCodeHash, otpExpiresAt, otpAttempts, ...safe } = doctor.toObject();
  return safe;
}

function toSafePatient(patient: InstanceType<typeof Patient>) {
  const { password, otpCodeHash, otpExpiresAt, otpAttempts, ...safe } = patient.toObject();
  return safe;
}
