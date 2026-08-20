import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/shared/button-link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <SearchX className="mb-2 h-10 w-10 text-primary" />
          <CardTitle className="text-2xl">Page not found</CardTitle>
          <CardDescription>The page you&apos;re looking for doesn&apos;t exist or may have moved.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2">
          <ButtonLink href="/">Back to home</ButtonLink>
        </CardContent>
      </Card>
    </div>
  );
}
