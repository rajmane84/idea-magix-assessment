import { Schema, model, type InferSchemaType } from "mongoose";

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
  },
  { timestamps: true }
);

export type PatientDocument = InferSchemaType<typeof patientSchema>;

export const Patient = model("Patient", patientSchema);
