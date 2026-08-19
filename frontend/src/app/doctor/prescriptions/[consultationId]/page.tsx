import { PrescriptionWorkspace } from "@/components/doctor/prescription-workspace";

export default async function DoctorPrescriptionDetailPage({
  params,
}: PageProps<"/doctor/prescriptions/[consultationId]">) {
  const { consultationId } = await params;
  return <PrescriptionWorkspace consultationId={consultationId} />;
}
