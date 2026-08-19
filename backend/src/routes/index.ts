import { Router } from "express";
import authRoutes from "./auth.routes";
import doctorRoutes from "./doctor.routes";
import consultationRoutes from "./consultation.routes";
import prescriptionRoutes from "./prescription.routes";
import uploadRoutes from "./upload.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/doctors", doctorRoutes);
router.use("/consultations", consultationRoutes);
router.use("/prescriptions", prescriptionRoutes);
router.use("/uploads", uploadRoutes);

export default router;
