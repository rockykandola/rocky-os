"use client";

import { useEffect, useMemo, useState } from "react";

function getElapsedParts(startedAt: Date, now: Date) {
  const elapsedMs = Math.max(0, now.getTime() - startedAt.getTime());
  const hours = Math.floor(elapsedMs / 36e5);
  const days = Math.floor(hours / 24);
  const phase = days === 0 ? "Cannabis Free Day 0" : days < 7 ? "Early reset" : days < 21 ? "Stabilizing routines" : "Evidence building";

  return { hours, days, phase };
}

export function TimeSinceCannabis({ sessionAtIso }: { sessionAtIso: string | null }) {
  const startedAt = useMemo(() => (sessionAtIso ? new Date(sessionAtIso) : null), [sessionAtIso]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  if (!startedAt) {
    return (
      <div className="rounded-lg bg-muted/50 p-3 text-sm">
        <p className="text-xs font-medium uppercase text-muted-foreground">Time since last cannabis</p>
        <p className="mt-2 font-semibold">Starts after final session</p>
        <p className="text-muted-foreground">Record the milestone when it is honestly complete.</p>
      </div>
    );
  }

  const elapsed = getElapsedParts(startedAt, now);

  return (
    <div className="grid gap-3 rounded-lg bg-primary/5 p-3 text-sm sm:grid-cols-3">
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">Hours</p>
        <p className="mt-1 text-2xl font-semibold">{elapsed.hours}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">Days</p>
        <p className="mt-1 text-2xl font-semibold">{elapsed.days}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">Current phase</p>
        <p className="mt-1 font-semibold">{elapsed.phase}</p>
      </div>
    </div>
  );
}
