import { Schema, model, Types, type InferSchemaType } from "mongoose";

const consultationSchema = new Schema(
  {
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },

    currentIllnessHistory: { type: String, required: true },
    recentSurgery: {
      hadSurgery: { type: Boolean, default: false },
      details: { type: String, default: "" },
      timeSpan: { type: String, default: "" }, 
    },

    familyMedicalHistory: {
      diabetesStatus: { type: String, enum: ["diabetic", "non-diabetic"], required: true },
      allergies: { type: String, default: "" },
      others: { type: String, default: "" },
    },

    payment: {
      transactionId: { type: String, required: true },
      qrCodeImage: { type: String, default: "" },
      amount: { type: Number, default: 500 },
    },

    status: {
      type: String,
      enum: ["pending", "prescribed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export type ConsultationDocument = InferSchemaType<typeof consultationSchema> & { _id: Types.ObjectId };

export const Consultation = model("Consultation", consultationSchema);
