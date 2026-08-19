import { Router } from "express";
import { consultationController } from "../controllers/consultation.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/payment-qr/:doctorId", requireAuth("patient"), consultationController.getPaymentQrCode);
router.post("/", requireAuth("patient"), consultationController.create);
router.get("/mine", requireAuth("patient"), consultationController.listForPatient);
router.get("/doctor/mine", requireAuth("doctor"), consultationController.listForDoctor);
router.get("/:id", requireAuth("doctor", "patient"), consultationController.getById);

export default router;
