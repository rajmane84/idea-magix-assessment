import { Schema, model, type InferSchemaType, type Model } from "mongoose";
import { hashPassword } from "../utils/password";
import { EMAIL_REGEX, PHONE_REGEX } from "../constants";

export interface IDoctor {
  profileImage: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  yearsOfExperience: number;
  password: string;
  isVerified: boolean;
  isActive: boolean;
  otpCodeHash: string | null;
  otpExpiresAt: Date | null;
  otpAttempts: number;
  otpLastSentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDoctorMethods {
  // comparePassword(candidate: string): Promise<boolean>;
  isOtpExpired(): boolean;
}

type DoctorModel = Model<IDoctor, {}, IDoctorMethods>;

const doctorSchema = new Schema<IDoctor, DoctorModel, IDoctorMethods>(
  {
    profileImage: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, "Invalid email format"],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [PHONE_REGEX, "Invalid phone number format"],
    },
    yearsOfExperience: { type: Number, required: true, min: 0, max: 150 },
    password: { type: String, required: true, select: false, minlength: 6 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    otpCodeHash: { type: String, select: false, default: null },
    otpExpiresAt: { type: Date, select: false, default: null },
    otpAttempts: { type: Number, select: false, default: 0 },
    // Prevents OTP-resend spam — check this before issuing a new code.
    otpLastSentAt: { type: Date, select: false, default: null },
  },
  { timestamps: true },
);

doctorSchema.index({ specialty: 1 });

doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});

doctorSchema.methods.isOtpExpired = function () {
  return !this.otpExpiresAt || this.otpExpiresAt.getTime() < Date.now();
};

export type DoctorDocument = InferSchemaType<typeof doctorSchema>;

export const Doctor = model("Doctor", doctorSchema);
