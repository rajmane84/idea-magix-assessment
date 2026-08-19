import { Schema, model, type InferSchemaType } from "mongoose";
import { hashPassword } from "../utils/password";

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
    otpAttempts: { type: Number, select: false, default: 0 },
  },
  { timestamps: true }
);

// Only re-hash when the password field itself changes, since .save() is also
// called for unrelated updates (OTP issuance/verification, etc.) - hashing an
// already-hashed value on every save would corrupt it.
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});

export type DoctorDocument = InferSchemaType<typeof doctorSchema>;

export const Doctor = model("Doctor", doctorSchema);
