import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { resolveAssetUrl } from "@/lib/api-client";
import type { Consultation, Patient } from "@/types";

export function ConsultationDetails({ consultation }: { consultation: Consultation }) {
  const patient = consultation.patient as Patient;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={resolveAssetUrl(patient?.profileImage)} alt={patient?.name} />
            <AvatarFallback>{patient?.name?.charAt(0) ?? "?"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{patient?.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{patient?.age} years old</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {patient?.illnessHistory?.length > 0 && (
          <div>
            <p className="mb-1 font-medium">Illness History (from profile)</p>
            <div className="flex flex-wrap gap-1.5">
              {patient.illnessHistory.map((illness, idx) => (
                <Badge key={idx} variant="outline">
                  {illness}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {patient?.surgeryHistory && (
          <div>
            <p className="font-medium">Surgery History (from profile)</p>
            <p className="text-muted-foreground">{patient.surgeryHistory}</p>
          </div>
        )}

        <Separator />

        <div>
          <p className="font-medium">Current Illness</p>
          <p className="text-muted-foreground">{consultation.currentIllnessHistory}</p>
        </div>

        <div>
          <p className="font-medium">Recent Surgery</p>
          {consultation.recentSurgery.hadSurgery ? (
            <p className="text-muted-foreground">
              {consultation.recentSurgery.details}{" "}
              {consultation.recentSurgery.timeSpan && `(${consultation.recentSurgery.timeSpan})`}
            </p>
          ) : (
            <p className="text-muted-foreground">None reported</p>
          )}
        </div>

        <Separator />

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="font-medium">Diabetic Status</p>
            <Badge variant="secondary" className="mt-1 capitalize">
              {consultation.familyMedicalHistory.diabetesStatus}
            </Badge>
          </div>
          <div>
            <p className="font-medium">Allergies</p>
            <p className="text-muted-foreground">{consultation.familyMedicalHistory.allergies || "None"}</p>
          </div>
        </div>

        {consultation.familyMedicalHistory.others && (
          <div>
            <p className="font-medium">Other Family Medical History</p>
            <p className="text-muted-foreground">{consultation.familyMedicalHistory.others}</p>
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between rounded-md bg-muted/50 p-3">
          <div>
            <p className="font-medium">Payment</p>
            <p className="text-muted-foreground">Transaction ID: {consultation.payment.transactionId}</p>
          </div>
          <Badge>₹{consultation.payment.amount}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
