"use client";

import { useState } from "react";

import { mbkruStrategicContent } from "@/lib/site-content";

const tabs = [
  { id: "vision", label: "Our Vision" },
  { id: "history", label: "Our History" },
  { id: "values", label: "Why Choose Us" },
] as const;

const content: Record<(typeof tabs)[number]["id"], { title: string; items: string[] }> = {
  vision: {
    title: "Our Vision",
    items: [mbkruStrategicContent.vision],
  },
  history: {
    title: "Our History",
    items: [
      "MBKRU was conceived to bridge the gap between citizens and the highest levels of government.",
      "Born from the recognition that Ghana's greatest untapped resource is the collective voice of its people.",
      "We stand ready to organize, amplify, and channel that voice directly to the Presidency and every elected official.",
    ],
  },
  values: {
    title: "Why Choose Us",
    items: [
      "Strict non-partisanship — no political party affiliation at leadership level.",
      "Technology-enabled transparency — real-time tracking and public dashboards.",
      "Direct presidential interface — monthly Citizens' Brief, quarterly Listening Sessions.",
      "Legal empowerment — free guidance, templates, and referrals for members.",
    ],
  },
};

export function AboutTabs() {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("vision");
  const data = content[active];

  return (
    <div>
      <div className="border-b border-[var(--border)]">
        <nav className="-mb-px flex gap-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                active === tab.id
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted-foreground)] hover:border-[var(--border)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">{data.title}</h3>
        <ul className="mt-4 space-y-3">
          {data.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[var(--muted-foreground)]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
