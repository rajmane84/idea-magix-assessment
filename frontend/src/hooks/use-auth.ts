import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import type {
  DoctorSignInPayload,
  DoctorSignUpPayload,
  PatientSignInPayload,
  PatientSignUpPayload,
} from "@/services/auth.service";
import { extractErrorMessage } from "@/lib/api-client";
import { useSession } from "@/providers/session-provider";

export function useDoctorSignUp() {
  const { loginAsDoctor } = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: DoctorSignUpPayload) => authService.doctorSignUp(payload),
    onSuccess: ({ doctor, token }) => {
      loginAsDoctor(doctor, token);
      toast.success("Account created successfully");
      router.push("/doctor/profile");
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDoctorSignIn() {
  const { loginAsDoctor } = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: DoctorSignInPayload) => authService.doctorSignIn(payload),
    onSuccess: ({ doctor, token }) => {
      loginAsDoctor(doctor, token);
      toast.success("Welcome back, " + doctor.name);
      router.push("/doctor/profile");
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function usePatientSignUp() {
  const { loginAsPatient } = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: PatientSignUpPayload) => authService.patientSignUp(payload),
    onSuccess: ({ patient, token }) => {
      loginAsPatient(patient, token);
      toast.success("Account created successfully");
      router.push("/patient/doctors");
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function usePatientSignIn() {
  const { loginAsPatient } = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: PatientSignInPayload) => authService.patientSignIn(payload),
    onSuccess: ({ patient, token }) => {
      loginAsPatient(patient, token);
      toast.success("Welcome back, " + patient.name);
      router.push("/patient/doctors");
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useLogout() {
  const { logout } = useSession();
  const router = useRouter();

  return () => {
    logout();
    authService.logout().catch(() => undefined);
    toast.success("Logged out");
    router.push("/");
  };
}
