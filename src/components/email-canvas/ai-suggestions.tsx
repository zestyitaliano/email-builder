"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CanvasElement } from "@/lib/types";
import { exportToHtml, getAiSuggestions } from "@/lib/actions";

interface AiSuggestionsProps {
  elements: CanvasElement[];
}

export function AiSuggestions({ elements }: AiSuggestionsProps) {
  const [result, setResult] = useState<{ suggestedFonts: string[]; suggestedColorPalettes: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAskAi = () => {
    setError(null);
    startTransition(async () => {
      const html = await exportToHtml(elements);
      const response = await getAiSuggestions(html);
      if ("error" in response && response.error) {
        setError(response.error);
        setResult(null);
        return;
      }
      if ("suggestions" in response && response.suggestions) {
        setResult(response.suggestions);
      }
    });
  };

  return (
    <div className="space-y-3">
      <Button variant="outline" className="w-full" onClick={handleAskAi} disabled={isPending}>
        {isPending ? "Gathering inspiration..." : "Ask AI"}
      </Button>
      {isPending && (
        <div className="space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      )}
      {result && !isPending && (
        <Card className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Suggested fonts</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {result.suggestedFonts.map((font) => (
                <li key={font}>{font}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Color palettes</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {result.suggestedColorPalettes.map((palette) => (
                <li key={palette}>{palette}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}
      {error && <p className="text-sm text-rose-500">{error}</p>}
    </div>
  );
}
