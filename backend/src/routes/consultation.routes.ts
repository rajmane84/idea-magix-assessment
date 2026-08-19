import { Router } from "express";
import {
  getConsultationPaymentQr,
  createConsultation,
  listConsultationsForPatient,
  listConsultationsForDoctor,
  getConsultationById,
} from "../controllers/consultation.controller";
import { requireAuth } from "../middleware/auth";
import { requireVerified } from "../middleware/requireVerified";

const router = Router();

router.get("/payment-qr/:doctorId", requireAuth("patient"), requireVerified(), getConsultationPaymentQr);
router.post("/", requireAuth("patient"), requireVerified(), createConsultation);
router.get("/mine", requireAuth("patient"), listConsultationsForPatient);
router.get("/doctor/mine", requireAuth("doctor"), listConsultationsForDoctor);
router.get("/:id", requireAuth("doctor", "patient"), getConsultationById);

export default router;
