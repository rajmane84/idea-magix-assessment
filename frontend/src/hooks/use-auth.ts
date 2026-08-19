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
    onSuccess: ({ doctor }) => {
      loginAsDoctor(doctor);
      toast.success("Account created. Check your email for a verification code.");
      router.push("/doctor/verify-otp");
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDoctorSignIn() {
  const { loginAsDoctor } = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: DoctorSignInPayload) => authService.doctorSignIn(payload),
    onSuccess: ({ doctor }) => {
      loginAsDoctor(doctor);
      toast.success("Welcome back, " + doctor.name);
      router.push(doctor.isVerified ? "/doctor/profile" : "/doctor/verify-otp");
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function usePatientSignUp() {
  const { loginAsPatient } = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: PatientSignUpPayload) => authService.patientSignUp(payload),
    onSuccess: ({ patient }) => {
      loginAsPatient(patient);
      toast.success("Account created. Check your email for a verification code.");
      router.push("/patient/verify-otp");
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function usePatientSignIn() {
  const { loginAsPatient } = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: PatientSignInPayload) => authService.patientSignIn(payload),
    onSuccess: ({ patient }) => {
      loginAsPatient(patient);
      toast.success("Welcome back, " + patient.name);
      router.push(patient.isVerified ? "/patient/doctors" : "/patient/verify-otp");
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useVerifyOtp() {
  const { role, updateCurrentUser } = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: (code: string) => authService.verifyOtp(code),
    onSuccess: (data) => {
      const user = "doctor" in data ? data.doctor : data.patient;
      updateCurrentUser(user);
      toast.success("Account verified successfully");
      router.push(role === "doctor" ? "/doctor/profile" : "/patient/doctors");
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: () => authService.resendOtp(),
    onSuccess: () => toast.success("A new verification code has been sent to your email"),
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
