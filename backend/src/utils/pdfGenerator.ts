import PDFDocument from "pdfkit";
import path from "node:path";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import { nanoid } from "nanoid";
import type { DoctorDocument } from "../models/Doctor";
import type { PatientDocument } from "../models/Patient";

const PRESCRIPTION_DIR = path.join(process.cwd(), "uploads", "prescriptions");

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

/**
 * Renders a prescription PDF to disk and returns its relative public path.
 * Re-generated on every save so edited prescriptions produce a fresh file.
 */
export async function generatePrescriptionPdf(data: PrescriptionPdfInput): Promise<string> {
  await fs.mkdir(PRESCRIPTION_DIR, { recursive: true });
  const fileName = `prescription-${nanoid()}.pdf`;
  const filePath = path.join(PRESCRIPTION_DIR, fileName);

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const writeStream = fsSync.createWriteStream(filePath);
  doc.pipe(writeStream);

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

  doc.end();

  await new Promise<void>((resolve, reject) => {
    writeStream.on("finish", () => resolve());
    writeStream.on("error", reject);
  });

  return `/uploads/prescriptions/${fileName}`;
}
