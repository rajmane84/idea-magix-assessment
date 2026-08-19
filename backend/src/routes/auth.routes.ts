import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/doctor/signup", authController.registerDoctor);
router.post("/doctor/signin", authController.loginDoctor);
router.post("/patient/signup", authController.registerPatient);
router.post("/patient/signin", authController.loginPatient);
router.post("/logout", authController.logout);
router.get("/me", requireAuth(), authController.me);
router.post("/verify-otp", requireAuth(), authController.verifyOtp);
router.post("/resend-otp", requireAuth(), authController.resendOtp);

export default router;
