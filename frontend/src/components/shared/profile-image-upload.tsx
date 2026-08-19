"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUploadProfileImage, useDeleteProfileImage } from "@/hooks/use-upload";
import { resolveAssetUrl } from "@/lib/api-client";
import { Loader2, Upload } from "lucide-react";

interface ProfileImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  fallback?: string;
}

export function ProfileImageUpload({ value, onChange, fallback = "?" }: ProfileImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const { mutateAsync: uploadImage, isPending } = useUploadProfileImage();
  const { mutate: deleteImage } = useDeleteProfileImage();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    const uploaded = await uploadImage(file).catch(() => null);
    if (!uploaded) return;

    // Replaced photos are cleaned up in the background so unused uploads don't pile up in Cloudinary.
    if (publicId) deleteImage(publicId);

    setPublicId(uploaded.publicId);
    onChange(uploaded.url);
  }

  const displayUrl = previewUrl ?? resolveAssetUrl(value);

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="h-24 w-24">
        <AvatarImage src={displayUrl} alt="Profile" />
        <AvatarFallback className="text-lg">{fallback}</AvatarFallback>
      </Avatar>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {isPending ? "Uploading..." : "Upload photo"}
      </Button>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        Your photo is uploaded as soon as you select it, before you submit the form.
      </p>
    </div>
  );
}
