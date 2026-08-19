import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

/**
 * All app uploads live under a single root folder in the Cloudinary account
 * (configurable via CLOUDINARY_FOLDER), with a subfolder per asset type so
 * they stay organized and easy to manage/browse in the Cloudinary dashboard.
 */
export const cloudinaryFolders = {
  profiles: `${env.cloudinary.folder}/profiles`,
} as const;

export { cloudinary };
