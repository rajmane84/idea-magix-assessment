import { Router } from "express";
import { uploadProfileImage as handleProfileImageUpload, deleteProfileImage } from "../controllers/upload.controller";
import { uploadProfileImage as uploadProfileImageMiddleware } from "../middleware/upload";
import { uploadLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/profile-image", uploadLimiter, uploadProfileImageMiddleware.single("image"), handleProfileImageUpload);
router.delete("/profile-image", uploadLimiter, deleteProfileImage);

export default router;
