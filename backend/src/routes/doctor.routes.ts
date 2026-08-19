import { Router } from "express";
import { listDoctors, getDoctorById } from "../controllers/doctor.controller";
import { requireAuth } from "../middleware/auth";
import { requireVerified } from "../middleware/requireVerified";

const router = Router();

router.get("/", requireAuth("patient"), requireVerified(), listDoctors);
router.get("/:id", requireAuth("patient"), requireVerified(), getDoctorById);

export default router;
