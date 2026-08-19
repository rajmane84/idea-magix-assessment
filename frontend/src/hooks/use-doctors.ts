import { useQuery } from "@tanstack/react-query";
import { doctorService } from "@/services/doctor.service";

export function useDoctors(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["doctors", page, limit],
    queryFn: () => doctorService.list(page, limit),
    placeholderData: (previousData) => previousData,
  });
}

export function useDoctor(id: string | undefined) {
  return useQuery({
    queryKey: ["doctors", id],
    queryFn: () => doctorService.getById(id as string),
    enabled: Boolean(id),
  });
}
