import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import type { DoctorSignUpInput, DoctorSignInInput, PatientSignUpInput, PatientSignInInput } from "../schemas/auth.schema";

export const authService = {
  async registerDoctor(input: DoctorSignUpInput) {
    const existing = await Doctor.findOne({ $or: [{ email: input.email }, { phone: input.phone }] });
    if (existing) {
      throw ApiError.conflict(
        existing.email === input.email ? "Email is already registered" : "Phone number is already registered"
      );
    }

    const password = await hashPassword(input.password);
    const doctor = await Doctor.create({ ...input, password });
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

    const password = await hashPassword(input.password);
    const patient = await Patient.create({ ...input, password });
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
};

function toSafeDoctor(doctor: InstanceType<typeof Doctor>) {
  const obj = doctor.toObject();
  delete (obj as { password?: string }).password;
  return obj;
}

function toSafePatient(patient: InstanceType<typeof Patient>) {
  const obj = patient.toObject();
  delete (obj as { password?: string }).password;
  return obj;
}
