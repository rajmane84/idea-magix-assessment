import { Schema, model, type InferSchemaType } from "mongoose";

const medicineSchema = new Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String, default: "" },
    frequency: { type: String, default: "" },
    duration: { type: String, default: "" },
  },
  { _id: false }
);

const prescriptionSchema = new Schema(
  {
    consultation: { type: Schema.Types.ObjectId, ref: "Consultation", required: true, unique: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },

    careToBeTaken: { type: String, required: true },
    medicines: { type: [medicineSchema], default: [] },

    pdfPath: { type: String, default: "" },
    pdfPublicId: { type: String, default: "" },
    sentToPatient: { type: Boolean, default: false },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type PrescriptionDocument = InferSchemaType<typeof prescriptionSchema>;

export const Prescription = model("Prescription", prescriptionSchema);
