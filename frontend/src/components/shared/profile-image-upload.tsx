"use client";

import { useEffect, useMemo, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ProfileImageUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  fallback?: string;
}

export function ProfileImageUpload({ value, onChange, fallback = "?" }: ProfileImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.files?.[0] ?? null);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="h-24 w-24">
        <AvatarImage src={previewUrl ?? undefined} alt="Profile" />
        <AvatarFallback className="text-lg">{fallback}</AvatarFallback>
      </Avatar>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" />
        {value ? "Change photo" : "Upload photo"}
      </Button>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        Your photo is uploaded when you submit the form.
      </p>
    </div>
  );
}
