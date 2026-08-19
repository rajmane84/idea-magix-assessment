import { Router } from "express";
import { doctorController } from "../controllers/doctor.controller";

const router = Router();

router.get("/", doctorController.list);
router.get("/:id", doctorController.getById);

export default router;
