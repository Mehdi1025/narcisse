"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/app/store";
import { fmtShort, fmtTime, sameDay } from "@/lib/app/rules";
import type { Profile } from "@/lib/app/types";
import { Card, Empty, cx } from "./ui";

export default function Notifications({ me }: { me: Profile }) {
  const { state, dispatch } = useStore();
  const list = state.notifications.filter((n) => n.to === me);
  // Snapshot des non-lues au moment de l'ouverture, puis tout marquer comme lu.
  const unreadIds = new Set(list.filter((n) => !n.read).map((n) => n.id));
  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: "readAll", to: me }), 1200);
    return () => clearTimeout(t);
  }, [dispatch, me]);

  return (
    <Card className="max-w-3xl">
      {list.length === 0 ? (
        <Empty>Aucune notification.</Empty>
      ) : (
        <ul className="divide-y divide-encre/[0.07]">
          {list.map((n) => (
            <li key={n.id} className="flex gap-4 py-3.5">
              <span className={cx("mt-1.5 h-2 w-2 shrink-0 rounded-full", unreadIds.has(n.id) || !n.read ? "bg-bordeaux" : "bg-encre/15")} />
              <p className="flex-1 text-[14px]">{n.text}</p>
              <span className="shrink-0 text-[12px] tabular-nums text-encre/45">{sameDay(new Date(n.at), new Date()) ? fmtTime(n.at) : fmtShort(n.at)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
