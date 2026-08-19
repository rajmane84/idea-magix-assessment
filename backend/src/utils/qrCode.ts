import QRCode from "qrcode";
import path from "node:path";
import fs from "node:fs/promises";
import { nanoid } from "nanoid";

const QR_DIR = path.join(process.cwd(), "uploads", "qr");

/**
 * Generates a static payment QR code (encodes a mock UPI-style payment string)
 * and persists it as a PNG so the frontend can render it in Step 3 of the
 * consultation form.
 */
export async function generatePaymentQrCode(amount: number, doctorName: string): Promise<string> {
  await fs.mkdir(QR_DIR, { recursive: true });
  const fileName = `${nanoid()}.png`;
  const filePath = path.join(QR_DIR, fileName);

  const payload = `upi://pay?pa=prescripto@bank&pn=${encodeURIComponent(
    doctorName
  )}&am=${amount}&cu=INR&tn=Consultation%20Fee`;

  await QRCode.toFile(filePath, payload, { width: 300, margin: 2 });

  return `/uploads/qr/${fileName}`;
}
