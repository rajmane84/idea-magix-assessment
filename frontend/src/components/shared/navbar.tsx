"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/providers/session-provider";
import { useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveAssetUrl } from "@/lib/api-client";
import { Stethoscope } from "lucide-react";

export function Navbar() {
  const { role, doctor, patient, isHydrated } = useSession();
  const logout = useLogout();
  const pathname = usePathname();

  const name = doctor?.name ?? patient?.name;
  const image = doctor?.profileImage ?? patient?.profileImage;
  const homeHref = role === "doctor" ? "/doctor/profile" : role === "patient" ? "/patient/doctors" : "/";
  const isVerifyOtpPage = pathname?.endsWith("/verify-otp") ?? false;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href={homeHref} className="flex items-center gap-2 font-semibold">
          <Stethoscope className="h-5 w-5 text-primary" />
          Prescripto
        </Link>

        {isHydrated && role && !isVerifyOtpPage && (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={resolveAssetUrl(image)} alt={name} />
              <AvatarFallback>{name?.charAt(0) ?? "?"}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">{name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
