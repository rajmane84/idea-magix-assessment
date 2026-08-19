import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/shared/button-link";
import { Stethoscope, User } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Prescripto</h1>
        <p className="mt-2 text-muted-foreground">Online consultations and prescriptions, simplified.</p>
      </div>

      <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader className="items-center text-center">
            <Stethoscope className="mb-2 h-10 w-10 text-primary" />
            <CardTitle>I&apos;m a Doctor</CardTitle>
            <CardDescription>Manage consultations and write prescriptions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <ButtonLink href="/doctor/signin">Doctor Sign In</ButtonLink>
            <ButtonLink href="/doctor/signup" variant="outline">
              Doctor Sign Up
            </ButtonLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="items-center text-center">
            <User className="mb-2 h-10 w-10 text-primary" />
            <CardTitle>I&apos;m a Patient</CardTitle>
            <CardDescription>Consult doctors and manage your prescriptions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <ButtonLink href="/patient/signin">Patient Sign In</ButtonLink>
            <ButtonLink href="/patient/signup" variant="outline">
              Patient Sign Up
            </ButtonLink>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
