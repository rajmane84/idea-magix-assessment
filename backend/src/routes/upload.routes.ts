import { Router } from "express";
import { uploadProfileImage as handleProfileImageUpload, deleteProfileImage } from "../controllers/upload.controller";
import { uploadProfileImage as uploadProfileImageMiddleware } from "../middleware/upload";

const router = Router();

router.post("/profile-image", uploadProfileImageMiddleware.single("image"), handleProfileImageUpload);
router.delete("/profile-image", deleteProfileImage);

export default router;
