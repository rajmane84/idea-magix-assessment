import { Router } from "express";
import { uploadController } from "../controllers/upload.controller";
import { uploadProfileImage } from "../middleware/upload";

const router = Router();

router.post("/profile-image", uploadProfileImage.single("image"), uploadController.uploadProfileImage);

export default router;
