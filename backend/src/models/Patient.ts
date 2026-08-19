import { Schema, model, type InferSchemaType } from "mongoose";
import { hashPassword } from "../utils/password";

const patientSchema = new Schema(
  {
    profileImage: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    surgeryHistory: { type: String, default: "" },
    // Stored as an array; frontend renders as comma-separated panel/pills.
    illnessHistory: { type: [String], default: [] },
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
patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});

export type PatientDocument = InferSchemaType<typeof patientSchema>;

export const Patient = model("Patient", patientSchema);
