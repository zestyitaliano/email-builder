"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CanvasElement } from "@/lib/types";
import { exportToHtml } from "@/lib/actions";

interface EmailPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elements: CanvasElement[];
}

export function EmailPreviewDialog({ open, onOpenChange, elements }: EmailPreviewDialogProps) {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    startTransition(async () => {
      const html = await exportToHtml(elements);
      setHtmlContent(html);
    });
  }, [open, elements]);

  if (!open) return null;

  const handleDownload = () => {
    if (!htmlContent) return;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "email-canvas.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-10">
      <div className="w-full max-w-5xl rounded-3xl bg-white p-6 shadow-2xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Preview</p>
            <p className="text-lg font-semibold text-slate-900">Live email preview</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDownload} disabled={!htmlContent}>
              Download HTML
            </Button>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </header>
        <div className="mt-6 min-h-[400px] rounded-2xl border border-slate-200 bg-[#F8F9FF] p-4">
          {isPending ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <iframe title="Email preview" className="h-[520px] w-full rounded-2xl border-0 bg-white" srcDoc={htmlContent} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
