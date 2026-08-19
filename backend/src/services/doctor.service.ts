import { Doctor } from "../models/Doctor";
import { ApiError } from "../utils/ApiError";

export const doctorService = {
  async listDoctors() {
    return Doctor.find().sort({ createdAt: -1 });
  },

  async getDoctorById(id: string) {
    const doctor = await Doctor.findById(id);
    if (!doctor) throw ApiError.notFound("Doctor not found");
    return doctor;
  },
};
