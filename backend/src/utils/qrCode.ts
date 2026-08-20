import QRCode from "qrcode";

/**
 * Generates a static payment QR code (encodes a mock UPI-style payment string)
 * and returns it as a base64 data URL so the frontend can render it directly
 * in Step 3 of the consultation form, without persisting anything to disk.
 */
export async function generatePaymentQrCode(amount: number, doctorName: string): Promise<string> {
  const payload = `upi://pay?pa=prescripto@bank&pn=${encodeURIComponent(
    doctorName
  )}&am=${amount}&cu=INR&tn=Consultation%20Fee`;

  return QRCode.toDataURL(payload, { width: 300, margin: 2 });
}
