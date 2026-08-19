import { Router } from "express";
import { prescriptionController } from "../controllers/prescription.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth("doctor"), prescriptionController.create);
router.put("/:id", requireAuth("doctor"), prescriptionController.update);
router.post("/:id/send", requireAuth("doctor"), prescriptionController.send);
router.get("/mine", requireAuth("patient"), prescriptionController.listForPatient);
router.get("/consultation/:consultationId", requireAuth("doctor", "patient"), prescriptionController.getByConsultation);
router.get("/:id", requireAuth("doctor", "patient"), prescriptionController.getById);

export default router;
