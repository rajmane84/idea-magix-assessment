import { useQuery } from "@tanstack/react-query";
import { doctorService } from "@/services/doctor.service";

export function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: () => doctorService.list(),
  });
}

export function useDoctor(id: string | undefined) {
  return useQuery({
    queryKey: ["doctors", id],
    queryFn: () => doctorService.getById(id as string),
    enabled: Boolean(id),
  });
}
