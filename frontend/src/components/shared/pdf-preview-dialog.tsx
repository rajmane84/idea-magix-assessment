"use client";

import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

interface PdfPreviewDialogProps {
  url: string;
  downloadFilename: string;
  triggerLabel?: string;
  triggerSize?: "sm" | "default";
}

/**
 * Preview opens the PDF in a new tab via the browser's built-in viewer.
 * Download uses the `download` attribute to suggest a meaningful filename
 * instead of the storage backend's random key.
 */
export function PdfPreviewDialog({
  url,
  downloadFilename,
  triggerLabel = "Preview",
  triggerSize = "default",
}: PdfPreviewDialogProps) {
  return (
    <div className="flex gap-2">
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
      <Button
        type="button"
        variant="outline"
        size={triggerSize}
        nativeButton={false}
        render={<a href={url} download={downloadFilename} target="_blank" rel="noopener noreferrer" />}
      >
        <Download className="h-4 w-4" />
        Download
      </Button>
    </div>
  );
}
