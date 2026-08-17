"use client";

import { useState } from "react";
import { Copy, ExternalLink, MessageCircle, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { sourcingResearch } from "@/lib/project-foundation/sourcing-research";

export function SourcingResearchPanel() {
  const [copied, setCopied] = useState<string | null>(null);

  async function copyMessage(useCase: string, message: string) {
    await navigator.clipboard.writeText(message);
    setCopied(useCase);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return <div className="grid gap-4">
    <div className="flex flex-col justify-between gap-2 rounded-lg border bg-muted/30 p-4 md:flex-row md:items-center">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-primary">UPDATED SOURCING WORKBOOK</p>
        <p className="mt-1 text-sm text-muted-foreground">{sourcingResearch.sourceWorkbook} · updated {sourcingResearch.lastUpdated}</p>
      </div>
      <Badge variant="secondary">Myanmar · Cambodia · Vietnam</Badge>
    </div>

    <div className="grid gap-4 lg:grid-cols-3">
      {sourcingResearch.strategy.map((item) => <Card key={item.country}>
        <CardHeader className="pb-2"><CardTitle className="text-base">{item.country}</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="font-medium">{item.bestUse}</p>
          <p className="text-muted-foreground">{item.why}</p>
          <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Risk:</span> {item.risk}</p>
          <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Next:</span> {item.nextAction}</p>
        </CardContent>
      </Card>)}
    </div>

    <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldAlert className="h-4 w-4 text-primary" />Myanmar entry and safety checks</CardTitle></CardHeader>
        <CardContent className="grid max-h-[520px] gap-3 overflow-auto pr-1 text-sm">
          {sourcingResearch.safety.map((item) => <div key={item.topic} className="rounded-lg border bg-background p-3">
            <p className="font-medium">{item.topic}</p>
            <p className="mt-1 text-muted-foreground">{item.recommendation}</p>
            <p className="mt-2 text-xs text-muted-foreground">{item.finding}</p>
            {item.sourceUrl && <a className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary" href={item.sourceUrl} target="_blank" rel="noreferrer">Source <ExternalLink className="h-3 w-3" /></a>}
          </div>)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><MessageCircle className="h-4 w-4 text-primary" />WhatsApp outreach scripts</CardTitle></CardHeader>
        <CardContent className="grid max-h-[520px] gap-3 overflow-auto pr-1">
          {sourcingResearch.scripts.map((item) => <div key={item.useCase} className="rounded-lg border bg-background p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{item.useCase}</p>
              <Button type="button" variant="outline" size="sm" className="h-8 gap-1" onClick={() => copyMessage(item.useCase, item.message)}><Copy className="h-3.5 w-3.5" />{copied === item.useCase ? "Copied" : "Copy"}</Button>
            </div>
            <Textarea readOnly value={item.message} className="mt-2 min-h-24 resize-none text-xs" />
          </div>)}
        </CardContent>
      </Card>
    </div>
  </div>;
}
