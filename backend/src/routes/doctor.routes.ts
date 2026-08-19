import { Router } from "express";
import { listDoctors, getDoctorById } from "../controllers/doctor.controller";

const router = Router();

router.get("/", listDoctors);
router.get("/:id", getDoctorById);

export default router;
