import PDFDocument from "pdfkit";
import type { DoctorDocument } from "../models/Doctor";
import type { PatientDocument } from "../models/Patient";

interface Medicine {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

interface PrescriptionPdfInput {
  doctor: Pick<DoctorDocument, "name" | "specialty" | "yearsOfExperience">;
  patient: Pick<PatientDocument, "name" | "age">;
  careToBeTaken: string;
  medicines: Medicine[];
  createdAt: Date;
}

/** Renders a prescription PDF and returns it as an in-memory buffer, ready to upload to Cloudinary. */
export async function generatePrescriptionPdf(data: PrescriptionPdfInput): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  doc.fontSize(20).text("Medical Prescription", { align: "center" });
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();

  doc.fontSize(12).text(`Dr. ${data.doctor.name}`, { continued: false });
  doc.fontSize(10).fillColor("#555").text(`${data.doctor.specialty} • ${data.doctor.yearsOfExperience} years experience`);
  doc.fillColor("#000");
  doc.moveDown();

  doc.fontSize(12).text(`Patient: ${data.patient.name}`);
  doc.fontSize(10).fillColor("#555").text(`Age: ${data.patient.age}`);
  doc.fillColor("#000");
  doc.fontSize(10).fillColor("#555").text(`Date: ${data.createdAt.toDateString()}`);
  doc.fillColor("#000");
  doc.moveDown();

  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();

  doc.fontSize(13).text("Care to be taken", { underline: true });
  doc.fontSize(11).moveDown(0.3).text(data.careToBeTaken, { align: "left" });
  doc.moveDown();

  doc.fontSize(13).text("Medicines", { underline: true });
  doc.moveDown(0.3);

  if (data.medicines.length === 0) {
    doc.fontSize(11).fillColor("#777").text("No medicines prescribed.");
    doc.fillColor("#000");
  } else {
    data.medicines.forEach((med, idx) => {
      const parts = [med.dosage, med.frequency, med.duration].filter(Boolean).join(" • ");
      doc.fontSize(11).text(`${idx + 1}. ${med.name}${parts ? `  (${parts})` : ""}`);
    });
  }

  doc.moveDown(2);
  doc.fontSize(9).fillColor("#888").text("This is a digitally generated prescription.", { align: "center" });

  const donePromise = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.end();

  return donePromise;
}
