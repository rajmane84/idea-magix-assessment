import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
export const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL ?? "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/** Resolves a relative `/uploads/...` path returned by the API into an absolute URL. */
export function resolveAssetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${ASSET_URL}${path}`;
}

export function buildDownloadUrl(url: string, filename: string): string {
  const slug = filename
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const uploadMarker = "/upload/";
  const markerIndex = url.indexOf(uploadMarker);
  if (!url.includes("res.cloudinary.com") || markerIndex === -1 || !slug) return url;

  const insertAt = markerIndex + uploadMarker.length;
  return `${url.slice(0, insertAt)}fl_attachment:${encodeURIComponent(slug)}/${url.slice(insertAt)}`;
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string })?.message ?? error.message ?? "Something went wrong";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
