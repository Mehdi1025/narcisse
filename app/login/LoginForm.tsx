"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { dashboardForRole, normalizeAppPath, resolveLoginEmail } from "@/lib/auth/login";
import type { SessionRole } from "@/lib/auth/login";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(params.get("error") === "profil" ? "Profil introuvable. Relancez les migrations." : null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const email = resolveLoginEmail(username);
    if (!email) {
      setError("Identifiant inconnu. Utilisez admin, lina ou travailleuse2.");
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { data, error: signError } = await supabase.auth.signInWithPassword({ email, password });
    if (signError) {
      setError(signError.message === "Invalid login credentials" ? "Identifiant ou mot de passe incorrect." : signError.message);
      setPending(false);
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    const role = profile?.role as SessionRole | undefined;
    if (!role) {
      setError("Compte sans profil. Exécutez npm run seed:users.");
      await supabase.auth.signOut();
      setPending(false);
      return;
    }
    const dest = normalizeAppPath(next);
    router.replace(dest ?? dashboardForRole(role));
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <label className="block text-sm">
        <span className="text-encre/70">Identifiant</span>
        <input
          className="mt-1 w-full rounded-xl border border-encre/15 px-3 py-2.5"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin"
          required
        />
      </label>
      <label className="block text-sm">
        <span className="text-encre/70">Mot de passe</span>
        <input
          type="password"
          className="mt-1 w-full rounded-xl border border-encre/15 px-3 py-2.5"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error && <p className="text-sm text-bordeaux">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-encre py-3 text-sm text-ivoire disabled:opacity-60"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}