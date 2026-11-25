"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cx } from "./ui";

type Props = {
  className?: string;
  /** Barre sombre (Shell), claire (header mobile), ou verre égéen (admin). */
  variant?: "dark" | "light" | "glass";
};

export default function LogoutButton({ className, variant = "light" }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const logout = async () => {
    setPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className={cx(
        "text-[13px] font-medium transition-colors disabled:opacity-60",
        variant === "dark" && "w-full rounded-xl border border-ivoire/15 px-3 py-2.5 text-ivoire/80 hover:bg-ivoire/10 hover:text-ivoire",
        variant === "light" && "rounded-full border border-encre/12 px-4 py-2 text-encre/75 hover:bg-encre/5 hover:text-encre",
        variant === "glass" &&
          "nx-inner h-11 rounded-full px-4 text-encre/80 hover:bg-[var(--nx-raised)]",
        className,
      )}
    >
      {pending ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}