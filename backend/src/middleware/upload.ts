import multer from "multer";

function imageFileFilter(req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"));
  }
  cb(null, true);
}

// Buffers the file in memory so it can be streamed straight to Cloudinary
// without ever touching the local filesystem.
export const uploadProfileImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
