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
import { authLimiter, otpLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/doctor/signup", authLimiter, registerDoctor);
router.post("/doctor/signin", authLimiter, loginDoctor);
router.post("/patient/signup", authLimiter, registerPatient);
router.post("/patient/signin", authLimiter, loginPatient);
router.post("/logout", logout);
router.get("/me", requireAuth(), me);
router.post("/verify-otp", requireAuth(), otpLimiter, verifyOtp);
router.post("/resend-otp", requireAuth(), otpLimiter, resendOtp);

export default router;
