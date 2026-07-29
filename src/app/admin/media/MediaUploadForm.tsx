"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";

export function MediaUploadForm() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(data.error || "Upload failed");
        setLoading(false);
        return;
      }
      form.reset();
      setStatus("Uploaded.");
      router.refresh();
    } catch {
      setStatus("Network error");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-[var(--foreground)]">Upload image</h2>
      <p className="mt-1 text-sm text-[var(--foreground-secondary)]">JPEG, PNG, WebP or GIF · max 8MB</p>
      <div className="mt-4 space-y-3">
        <FormField label="File" htmlFor="file">
          <Input
            id="file"
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
            density="admin"
            className="border-0 bg-transparent px-0 shadow-none"
          />
        </FormField>
        <FormField label="Alt text" htmlFor="alt" optional>
          <Input id="alt" type="text" name="alt" placeholder="Alt text (optional)" density="admin" />
        </FormField>
        <Button type="submit" density="admin" disabled={loading} loading={loading} loadingLabel="Uploading…">
          Upload
        </Button>
        {status ? <p className="text-sm text-[var(--foreground-secondary)]">{status}</p> : null}
      </div>
    </form>
  );
}
