import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/shared/button-link";
import { resolveAssetUrl } from "@/lib/api-client";
import type { Doctor } from "@/types";

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="items-center text-center">
        <Avatar className="h-20 w-20">
          <AvatarImage src={resolveAssetUrl(doctor.profileImage)} alt={doctor.name} />
          <AvatarFallback className="text-lg">{doctor.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">Dr. {doctor.name}</p>
          <Badge variant="secondary" className="mt-1">
            {doctor.specialty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground">
        {doctor.yearsOfExperience} years of experience
      </CardContent>
      <CardFooter>
        <ButtonLink href={`/patient/consult/${doctor._id}`} className="w-full">
          Consult
        </ButtonLink>
      </CardFooter>
    </Card>
  );
}
