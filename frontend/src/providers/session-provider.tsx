"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Doctor, Patient, UserRole } from "@/types";

interface SessionState {
  role: UserRole | null;
  doctor: Doctor | null;
  patient: Patient | null;
  token: string | null;
  isHydrated: boolean;
}

interface SessionContextValue extends SessionState {
  loginAsDoctor: (doctor: Doctor, token: string) => void;
  loginAsPatient: (patient: Patient, token: string) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  token: "token",
  role: "role",
  doctor: "doctor",
  patient: "patient",
} as const;

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    role: null,
    doctor: null,
    patient: null,
    token: null,
    isHydrated: false,
  });

  useEffect(() => {
    const token = window.localStorage.getItem(STORAGE_KEYS.token);
    const role = window.localStorage.getItem(STORAGE_KEYS.role) as UserRole | null;
    const doctorRaw = window.localStorage.getItem(STORAGE_KEYS.doctor);
    const patientRaw = window.localStorage.getItem(STORAGE_KEYS.patient);

    setState({
      token,
      role,
      doctor: doctorRaw ? (JSON.parse(doctorRaw) as Doctor) : null,
      patient: patientRaw ? (JSON.parse(patientRaw) as Patient) : null,
      isHydrated: true,
    });
  }, []);

  const loginAsDoctor = useCallback((doctor: Doctor, token: string) => {
    window.localStorage.setItem(STORAGE_KEYS.token, token);
    window.localStorage.setItem(STORAGE_KEYS.role, "doctor");
    window.localStorage.setItem(STORAGE_KEYS.doctor, JSON.stringify(doctor));
    window.localStorage.removeItem(STORAGE_KEYS.patient);
    setState({ role: "doctor", doctor, patient: null, token, isHydrated: true });
  }, []);

  const loginAsPatient = useCallback((patient: Patient, token: string) => {
    window.localStorage.setItem(STORAGE_KEYS.token, token);
    window.localStorage.setItem(STORAGE_KEYS.role, "patient");
    window.localStorage.setItem(STORAGE_KEYS.patient, JSON.stringify(patient));
    window.localStorage.removeItem(STORAGE_KEYS.doctor);
    setState({ role: "patient", patient, doctor: null, token, isHydrated: true });
  }, []);

  const logout = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
    setState({ role: null, doctor: null, patient: null, token: null, isHydrated: true });
  }, []);

  return (
    <SessionContext.Provider value={{ ...state, loginAsDoctor, loginAsPatient, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
