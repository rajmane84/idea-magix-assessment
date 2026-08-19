import { Router } from "express";
import {
  createPrescription,
  updatePrescription,
  sendPrescription,
  listPrescriptionsForPatient,
  getPrescriptionByConsultation,
  getPrescriptionById,
} from "../controllers/prescription.controller";
import { requireAuth } from "../middleware/auth";
import { requireVerified } from "../middleware/requireVerified";

const router = Router();

router.post("/", requireAuth("doctor"), requireVerified(), createPrescription);
router.put("/:id", requireAuth("doctor"), requireVerified(), updatePrescription);
router.post("/:id/send", requireAuth("doctor"), requireVerified(), sendPrescription);
router.get("/mine", requireAuth("patient"), listPrescriptionsForPatient);
router.get("/consultation/:consultationId", requireAuth("doctor", "patient"), getPrescriptionByConsultation);
router.get("/:id", requireAuth("doctor", "patient"), getPrescriptionById);

export default router;
