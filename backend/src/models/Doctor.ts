import { Schema, model, type InferSchemaType } from "mongoose";

const doctorSchema = new Schema(
  {
    profileImage: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    yearsOfExperience: { type: Number, required: true, min: 0 },
    password: { type: String, required: true, select: false },
    isVerified: { type: Boolean, default: false },
    otpCodeHash: { type: String, select: false, default: null },
    otpExpiresAt: { type: Date, select: false, default: null },
  },
  { timestamps: true }
);

export type DoctorDocument = InferSchemaType<typeof doctorSchema>;

export const Doctor = model("Doctor", doctorSchema);
