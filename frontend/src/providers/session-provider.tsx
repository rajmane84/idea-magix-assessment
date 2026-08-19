"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Doctor, Patient, UserRole } from "@/types";

interface SessionState {
  role: UserRole | null;
  doctor: Doctor | null;
  patient: Patient | null;
  isHydrated: boolean;
}

interface SessionContextValue extends SessionState {
  loginAsDoctor: (doctor: Doctor) => void;
  loginAsPatient: (patient: Patient) => void;
  updateCurrentUser: (user: Doctor | Patient) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  role: "role",
  doctor: "doctor",
  patient: "patient",
} as const;

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    role: null,
    doctor: null,
    patient: null,
    isHydrated: false,
  });

  useEffect(() => {
    const role = window.localStorage.getItem(STORAGE_KEYS.role) as UserRole | null;
    const doctorRaw = window.localStorage.getItem(STORAGE_KEYS.doctor);
    const patientRaw = window.localStorage.getItem(STORAGE_KEYS.patient);

    setState({
      role,
      doctor: doctorRaw ? (JSON.parse(doctorRaw) as Doctor) : null,
      patient: patientRaw ? (JSON.parse(patientRaw) as Patient) : null,
      isHydrated: true,
    });
  }, []);

  const loginAsDoctor = useCallback((doctor: Doctor) => {
    window.localStorage.setItem(STORAGE_KEYS.role, "doctor");
    window.localStorage.setItem(STORAGE_KEYS.doctor, JSON.stringify(doctor));
    window.localStorage.removeItem(STORAGE_KEYS.patient);
    setState({ role: "doctor", doctor, patient: null, isHydrated: true });
  }, []);

  const loginAsPatient = useCallback((patient: Patient) => {
    window.localStorage.setItem(STORAGE_KEYS.role, "patient");
    window.localStorage.setItem(STORAGE_KEYS.patient, JSON.stringify(patient));
    window.localStorage.removeItem(STORAGE_KEYS.doctor);
    setState({ role: "patient", patient, doctor: null, isHydrated: true });
  }, []);

  const updateCurrentUser = useCallback((user: Doctor | Patient) => {
    setState((prev) => {
      if (prev.role === "doctor") {
        window.localStorage.setItem(STORAGE_KEYS.doctor, JSON.stringify(user));
        return { ...prev, doctor: user as Doctor };
      }
      if (prev.role === "patient") {
        window.localStorage.setItem(STORAGE_KEYS.patient, JSON.stringify(user));
        return { ...prev, patient: user as Patient };
      }
      return prev;
    });
  }, []);

  const logout = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
    setState({ role: null, doctor: null, patient: null, isHydrated: true });
  }, []);

  return (
    <SessionContext.Provider value={{ ...state, loginAsDoctor, loginAsPatient, updateCurrentUser, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
