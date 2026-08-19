import { Router } from "express";
import {
  registerDoctor,
  loginDoctor,
  registerPatient,
  loginPatient,
  logout,
  me,
  verifyOtp,
  resendOtp,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/doctor/signup", registerDoctor);
router.post("/doctor/signin", loginDoctor);
router.post("/patient/signup", registerPatient);
router.post("/patient/signin", loginPatient);
router.post("/logout", logout);
router.get("/me", requireAuth(), me);
router.post("/verify-otp", requireAuth(), verifyOtp);
router.post("/resend-otp", requireAuth(), resendOtp);

export default router;
