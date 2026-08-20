import QRCode from "qrcode";

export async function generatePaymentQrCode(amount: number, doctorName: string): Promise<string> {
  const payload = `upi://pay?pa=prescripto@bank&pn=${encodeURIComponent(
    doctorName
  )}&am=${amount}&cu=INR&tn=Consultation%20Fee`;

  return QRCode.toDataURL(payload, { width: 300, margin: 2 });
}
