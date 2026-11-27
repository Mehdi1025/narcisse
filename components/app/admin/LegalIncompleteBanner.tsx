"use client";

import { useEffect, useState } from "react";

export default function LegalIncompleteBanner() {
  const [missing, setMissing] = useState<string[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/legal-status", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((j) => setMissing(j.missing ?? []))
      .catch(() => setMissing([]));
  }, []);

  if (!missing?.length) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-50 px-4 py-4 text-[13px] text-amber-950" role="status">
      <p className="font-medium">Informations légales incomplètes — compléter content/legal.ts avant le mode live Stripe.</p>
      <ul className="mt-2 list-disc pl-5">
        {missing.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  );
}