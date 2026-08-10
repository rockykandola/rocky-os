"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { importFoundationVendorLeads } from "@/server/actions/project-foundation";

export function ImportVendorLeadsButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return <Button variant="outline" disabled={isPending} onClick={() => startTransition(async () => { await importFoundationVendorLeads(); router.refresh(); })}>{isPending ? "Importing…" : "Import 30 vendor leads"}</Button>;
}
