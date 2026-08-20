import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { env } from "../config/env";

export interface StoredAsset {
  url: string;
  publicId: string;
}

const PROFILES_FOLDER = "profiles";
const PRESCRIPTIONS_FOLDER = "prescriptions";

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const s3Client =
  env.storage.driver === "s3"
    ? new S3Client({
        region: env.storage.s3.region,
        endpoint: env.storage.s3.endpoint,
        forcePathStyle: env.storage.s3.forcePathStyle,
        credentials: {
          accessKeyId: env.storage.s3.accessKeyId!,
          secretAccessKey: env.storage.s3.secretAccessKey!,
        },
      })
    : null;

function assertKeyInFolder(key: string, folder: string, label: string) {
  if (!key.startsWith(`${folder}/`)) {
    throw new Error(`Invalid ${label} reference`);
  }
}

function buildKey(folder: string, ext: string, filenameHint?: string): string {
  const slug = filenameHint
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug ? `${folder}/${slug}-${nanoid(8)}${ext}` : `${folder}/${nanoid()}${ext}`;
}

async function localSave(buffer: Buffer, folder: string, ext: string, filenameHint?: string): Promise<StoredAsset> {
  const key = buildKey(folder, ext, filenameHint);
  const filePath = path.join(env.storage.localDir, key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await Bun.write(filePath, buffer);
  return { url: `${env.serverUrl}/uploads/${key}`, publicId: key };
}

async function localDelete(key: string): Promise<void> {
  const filePath = path.join(env.storage.localDir, key);
  await unlink(filePath).catch((err) => {
    if (err.code !== "ENOENT") throw err;
  });
}

async function s3Save(
  buffer: Buffer,
  folder: string,
  ext: string,
  contentType: string,
  filenameHint?: string
): Promise<StoredAsset> {
  const key = buildKey(folder, ext, filenameHint);
  await s3Client!.send(
    new PutObjectCommand({
      Bucket: env.storage.s3.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return { url: `${env.storage.s3.publicUrl}/${key}`, publicId: key };
}

async function s3Delete(key: string): Promise<void> {
  await s3Client!.send(new DeleteObjectCommand({ Bucket: env.storage.s3.bucket, Key: key }));
}

async function save(
  buffer: Buffer,
  folder: string,
  ext: string,
  contentType: string,
  filenameHint?: string
): Promise<StoredAsset> {
  return env.storage.driver === "s3"
    ? s3Save(buffer, folder, ext, contentType, filenameHint)
    : localSave(buffer, folder, ext, filenameHint);
}

async function remove(key: string): Promise<void> {
  return env.storage.driver === "s3" ? s3Delete(key) : localDelete(key);
}

export const storageService = {
  async addProfileImage(buffer: Buffer, mimetype: string): Promise<StoredAsset> {
    try {
      const ext = IMAGE_EXTENSIONS[mimetype] ?? "";
      return await save(buffer, PROFILES_FOLDER, ext, mimetype);
    } catch (err) {
      console.error("Failed to upload profile image", err);
      throw new Error("Failed to upload image. Please try again.");
    }
  },

  async deleteProfileImage(publicId: string): Promise<void> {
    assertKeyInFolder(publicId, PROFILES_FOLDER, "image");
    await remove(publicId);
  },

  async addPrescriptionPdf(buffer: Buffer, filenameHint?: string): Promise<StoredAsset> {
    try {
      return await save(buffer, PRESCRIPTIONS_FOLDER, ".pdf", "application/pdf", filenameHint);
    } catch (err) {
      console.error("Failed to upload prescription PDF", err);
      throw new Error("Failed to upload prescription PDF. Please try again.");
    }
  },

  async deletePrescriptionPdf(publicId: string): Promise<void> {
    assertKeyInFolder(publicId, PRESCRIPTIONS_FOLDER, "PDF");
    await remove(publicId);
  },
};
