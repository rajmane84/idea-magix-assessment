import { Router } from "express";
import { prescriptionController } from "../controllers/prescription.controller";
import { requireAuth } from "../middleware/auth";
import { requireVerified } from "../middleware/requireVerified";

const router = Router();

router.post("/", requireAuth("doctor"), requireVerified(), prescriptionController.create);
router.put("/:id", requireAuth("doctor"), requireVerified(), prescriptionController.update);
router.post("/:id/send", requireAuth("doctor"), requireVerified(), prescriptionController.send);
router.get("/mine", requireAuth("patient"), prescriptionController.listForPatient);
router.get("/consultation/:consultationId", requireAuth("doctor", "patient"), prescriptionController.getByConsultation);
router.get("/:id", requireAuth("doctor", "patient"), prescriptionController.getById);

export default router;
