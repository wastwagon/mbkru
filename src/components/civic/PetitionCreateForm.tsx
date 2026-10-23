"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { mobileFormStickySubmitBarClass } from "@/lib/mobile-ui-classes";
import { PETITION_TOPICS, petitionTopicLabel, type PetitionTopicValue } from "@/lib/petition-topics";

type Region = { id: string; name: string };

export function PetitionCreateForm({ regions }: { regions: Region[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState<PetitionTopicValue>("OTHER");
  const [targetSignatures, setTargetSignatures] = useState("");
  const [regionId, setRegionId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const ts = targetSignatures.trim();
      const res = await fetch("/api/petitions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim() || null,
          body: body.trim(),
          topic,
          targetSignatures: ts ? Number.parseInt(ts, 10) : null,
          regionId: regionId || null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; slug?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not create petition.");
        return;
      }
      if (data.slug) router.push(`/petitions/${encodeURIComponent(data.slug)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </p>
      ) : null}
      <FormField label="Title" htmlFor="pt-title">
        <Input
          id="pt-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={280}
          placeholder="Short headline for your petition"
        />
      </FormField>
      <FormField label="Summary" htmlFor="pt-summary" optional>
        <Input
          id="pt-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          maxLength={500}
          placeholder="One line for listings"
        />
      </FormField>
      <FormField
        label="Full text"
        htmlFor="pt-body"
        hint="MBKRU is independent; petitions express citizen concern, not a government or court filing."
      >
        <Textarea
          id="pt-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={10}
          maxLength={50_000}
          className="min-h-[200px]"
          placeholder="Context, asks, and what success looks like. Be factual and respectful."
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Topic" htmlFor="pt-topic">
          <Select
            id="pt-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value as PetitionTopicValue)}
            required
          >
            {PETITION_TOPICS.map((t) => (
              <option key={t} value={t}>
                {petitionTopicLabel(t)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Signature goal" htmlFor="pt-goal" optional>
          <Input
            id="pt-goal"
            type="number"
            min={10}
            max={10_000_000}
            value={targetSignatures}
            onChange={(e) => setTargetSignatures(e.target.value)}
            placeholder="e.g. 500"
          />
        </FormField>
        <FormField label="Region" htmlFor="pt-region" optional className="sm:col-span-2">
          <Select id="pt-region" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
            <option value="">All / national</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <div className={mobileFormStickySubmitBarClass}>
        <Button type="submit" loading={busy} loadingLabel="Publishing…" className="w-full min-w-0 justify-center sm:w-auto">
          Publish petition
        </Button>
      </div>
    </form>
  );
}
