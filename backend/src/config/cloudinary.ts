import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

export const cloudinaryFolders = {
  profiles: `${env.cloudinary.folder}/profiles`,
  prescriptions: `${env.cloudinary.folder}/prescriptions`,
} as const;

export { cloudinary };
