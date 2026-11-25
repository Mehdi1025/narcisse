import type { Metadata } from "next";
import "./app.css";

export const metadata: Metadata = {
  title: { default: "Narcisse — Espace de gestion", template: "%s · Narcisse" },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="app-body">{children}</div>;
}