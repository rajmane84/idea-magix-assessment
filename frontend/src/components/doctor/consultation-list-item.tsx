import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/shared/button-link";
import { format } from "date-fns";
import type { Consultation, Patient } from "@/types";

export function ConsultationListItem({ consultation }: { consultation: Consultation }) {
  const patient = consultation.patient as Patient;

  return (
    <Card>
      <CardContent className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11">
            <AvatarImage src={patient?.profileImage} alt={patient?.name} />
            <AvatarFallback>{patient?.name?.charAt(0) ?? "?"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{patient?.name}</p>
            <p className="text-xs text-muted-foreground">
              {patient?.age} yrs • Submitted {format(new Date(consultation.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={consultation.status === "prescribed" ? "default" : "secondary"}>
            {consultation.status === "prescribed" ? "Prescribed" : "Pending"}
          </Badge>
          <ButtonLink href={`/doctor/prescriptions/${consultation._id}`} size="sm">
            {consultation.status === "prescribed" ? "View / Edit" : "Write Prescription"}
          </ButtonLink>
        </div>
      </CardContent>
    </Card>
  );
}
