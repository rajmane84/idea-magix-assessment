"use client";

import { Button } from "@/components/ui/button";
import { buildDownloadUrl } from "@/lib/api-client";
import { Eye, Download } from "lucide-react";

interface PdfPreviewDialogProps {
  url: string;
  downloadFilename: string;
  triggerLabel?: string;
  triggerSize?: "sm" | "default";
}

/**
 * Preview opens the PDF in a new tab via the browser's built-in viewer.
 * Download forces a save under a meaningful filename instead of Cloudinary's random public ID.
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
        render={<a href={buildDownloadUrl(url, downloadFilename)} target="_blank" rel="noopener noreferrer" />}
      >
        <Download className="h-4 w-4" />
        Download
      </Button>
    </div>
  );
}
