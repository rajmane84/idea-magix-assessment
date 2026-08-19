import { Schema, model, type InferSchemaType, type Model } from "mongoose";
import { hashPassword } from "../utils/password";
import { EMAIL_REGEX, PHONE_REGEX } from "../constants";

export interface IPatient {
  profileImage: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  surgeryHistory: string;
  illnessHistory: string[];
  password: string;
  isVerified: boolean;
  otpCodeHash: string | null;
  otpExpiresAt: Date | null;
  otpAttempts: number;
  otpLastSentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPatientMethods {
  isOtpExpired(): boolean;
}

type PatientModel = Model<IPatient, {}, IPatientMethods>;

const patientSchema = new Schema<IPatient, PatientModel, IPatientMethods>(
  {
    profileImage: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0 },
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
    surgeryHistory: { type: String, default: "" },
    // Stored as an array; frontend renders as comma-separated panel/pills.
    illnessHistory: { type: [String], default: [] },
    password: { type: String, required: true, select: false, minlength: 6 },
    isVerified: { type: Boolean, default: false },
    otpCodeHash: { type: String, select: false, default: null },
    otpExpiresAt: { type: Date, select: false, default: null },
    otpAttempts: { type: Number, select: false, default: 0 },
    // Prevents OTP-resend spam — check this before issuing a new code.
    otpLastSentAt: { type: Date, select: false, default: null },
  },
  { timestamps: true }
);

patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});

patientSchema.methods.isOtpExpired = function () {
  return !this.otpExpiresAt || this.otpExpiresAt.getTime() < Date.now();
};

export type PatientDocument = InferSchemaType<typeof patientSchema>;

export const Patient = model("Patient", patientSchema);
