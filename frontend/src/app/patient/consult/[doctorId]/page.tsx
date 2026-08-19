import { ConsultationForm } from "@/components/patient/consultation-form";

export default async function ConsultPage({ params }: PageProps<"/patient/consult/[doctorId]">) {
  const { doctorId } = await params;
  return <ConsultationForm doctorId={doctorId} />;
}
