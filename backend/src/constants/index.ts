import { env } from "../config/env";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

export const MAX_OTP_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

export const CONSULTATION_FEE = 500;
export const MAX_CONSULTATIONS_PER_PATIENT_PER_DAY = 4;