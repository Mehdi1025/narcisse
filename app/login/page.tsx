import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Connexion", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-papier px-4">
      <div className="w-full max-w-md rounded-[24px] border border-encre/10 bg-white p-8 shadow-sm">
        <p className="text-[11px] uppercase tracking-[0.2em] text-encre/50">Narcisse</p>
        <h1 className="mt-2 font-serif text-3xl text-encre">Espace de gestion</h1>
        <p className="mt-2 text-sm text-encre/60">Identifiant et mot de passe fournis par Narcisse.</p>
        <Suspense fallback={<p className="mt-8 text-sm text-encre/50">Chargement…</p>}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-xs text-encre/45">
          Démo : <strong>admin</strong>, <strong>lina</strong> ou <strong>travailleuse2</strong> — mot de passe <strong>password</strong>
        </p>
      </div>
    </main>
  );
}