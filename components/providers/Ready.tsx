"use client";

import { useEffect } from "react";

/** Signale que l'application a démarré (désactive la sécurité « contenu visible » du layout). */
export default function Ready() {
  useEffect(() => {
    (window as Window & { __narcisseReady?: boolean }).__narcisseReady = true;
  }, []);
  return null;
}
