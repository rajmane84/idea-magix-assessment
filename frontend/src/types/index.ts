export type UserRole = "doctor" | "patient";

export interface Doctor {
  _id: string;
  profileImage: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  yearsOfExperience: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  _id: string;
  profileImage: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  surgeryHistory: string;
  illnessHistory: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecentSurgery {
  hadSurgery: boolean;
  details: string;
  timeSpan: string;
}

export interface FamilyMedicalHistory {
  diabetesStatus: "diabetic" | "non-diabetic";
  allergies: string;
  others: string;
}

export interface ConsultationPayment {
  transactionId: string;
  qrCodeImage: string;
  amount: number;
}

export interface Consultation {
  _id: string;
  doctor: Doctor | string;
  patient: Patient | string;
  currentIllnessHistory: string;
  recentSurgery: RecentSurgery;
  familyMedicalHistory: FamilyMedicalHistory;
  payment: ConsultationPayment;
  status: "pending" | "prescribed";
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

export interface Prescription {
  _id: string;
  consultation: Consultation | string;
  doctor: Doctor | string;
  patient: Patient | string;
  careToBeTaken: string;
  medicines: Medicine[];
  pdfPath: string;
  sentToPatient: boolean;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: unknown;
}
