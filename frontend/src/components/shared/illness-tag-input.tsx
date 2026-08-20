"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface IllnessTagInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export function IllnessTagInput({ value, onChange, id }: IllnessTagInputProps) {
  const [draft, setDraft] = useState("");

  const tags = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  function commitDraft() {
    const tag = draft.trim();
    if (!tag) {
      setDraft("");
      return;
    }
    if (!tags.includes(tag)) {
      onChange([...tags, tag].join(", "));
    }
    setDraft("");
  }

  function removeTag(tagToRemove: string) {
    onChange(tags.filter((tag) => tag !== tagToRemove).join(", "));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
      return;
    }
    if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div className="space-y-2">
      <Input
        id={id}
        placeholder="Type an illness and press Enter or , (e.g. Asthma)"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 rounded-md border bg-muted/40 p-2">
          {tags.map((tag, idx) => (
            <Badge key={`${tag}-${idx}`} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="rounded-full p-0.5 hover:bg-foreground/10"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
