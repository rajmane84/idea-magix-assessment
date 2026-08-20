"use client";

import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface PdfPreviewDialogProps {
  url: string;
  triggerLabel?: string;
  triggerSize?: "sm" | "default";
}

export function PdfPreviewDialog({
  url,
  triggerLabel = "Preview",
  triggerSize = "default",
}: PdfPreviewDialogProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size={triggerSize}
      nativeButton={false}
      render={<a href={url} target="_blank" rel="noopener noreferrer" />}
    >
      <Eye className="h-4 w-4" />
      {triggerLabel}
    </Button>
  );
}
