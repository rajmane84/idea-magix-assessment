import { cloudinary, cloudinaryFolders } from "../config/cloudinary";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

/** Uploads a buffer (e.g. from a Multer memory-storage file) to the given Cloudinary folder. */
function uploadBuffer(buffer: Buffer, folder: string): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error("Cloudinary upload failed"));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
}

/** Removes a previously uploaded asset by its Cloudinary public ID. */
async function deleteAsset(publicId: string): Promise<void> {
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary deletion failed for ${publicId}: ${result.result}`);
  }
}

export const cloudinaryService = {
  async addProfileImage(buffer: Buffer): Promise<CloudinaryUploadResult> {
    try {
      return await uploadBuffer(buffer, cloudinaryFolders.profiles);
    } catch (err) {
      console.error("Failed to upload profile image to Cloudinary", err);
      throw new Error("Failed to upload image. Please try again.");
    }
  },

  async deleteProfileImage(publicId: string): Promise<void> {
    if (!publicId.startsWith(`${cloudinaryFolders.profiles}/`)) {
      throw new Error("Invalid image reference");
    }
    await deleteAsset(publicId);
  },
};
