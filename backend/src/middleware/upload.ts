import multer from "multer";

function imageFileFilter(req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"));
  }
  cb(null, true);
}

// Buffers the file in memory so the storage service can write it straight to
// its destination (disk or S3) without an intermediate temp file.
export const uploadProfileImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
