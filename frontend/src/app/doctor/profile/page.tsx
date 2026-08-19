"use client";

import { useRequireRole } from "@/hooks/use-require-role";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/shared/button-link";
import { Separator } from "@/components/ui/separator";
import { resolveAssetUrl } from "@/lib/api-client";
import { FileText, Mail, Phone, Briefcase } from "lucide-react";

export default function DoctorProfilePage() {
  const { isReady, doctor } = useRequireRole("doctor", "/doctor/signin");

  if (!isReady || !doctor) return null;

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <Card>
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={resolveAssetUrl(doctor.profileImage)} alt={doctor.name} />
            <AvatarFallback className="text-2xl">{doctor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold">Dr. {doctor.name}</h1>
          <Badge variant="secondary">{doctor.specialty}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {doctor.email}
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {doctor.phone}
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              {doctor.yearsOfExperience} years of experience
            </div>
          </div>
          <Separator />
          <ButtonLink href="/doctor/prescriptions" className="w-full">
            <FileText className="h-4 w-4" />
            Go to Prescriptions
          </ButtonLink>
        </CardContent>
      </Card>
    </div>
  );
}
