"use client";

import { useMemo, useState } from "react";
import { renderTemplate } from "@/lib/emailRenderer";
import { selectNodes, useBuilderStore } from "@/lib/stores/useBuilderStore";

export function ExportButton() {
  const nodes = useBuilderStore(selectNodes);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const html = useMemo(() => renderTemplate(nodes), [nodes]);

  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "email-template.html";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
        onClick={() => setIsPreviewOpen(true)}
        disabled={nodes.length === 0}
      >
        Preview
      </button>
      <button
        type="button"
        className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        onClick={handleDownload}
        disabled={nodes.length === 0}
      >
        Export HTML
      </button>
      {isPreviewOpen && <PreviewModal html={html} onClose={() => setIsPreviewOpen(false)} />}
    </div>
  );
}

function PreviewModal({ html, onClose }: { html: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Preview export</p>
            <p className="text-xs text-slate-500">Rendered below using the current builder data.</p>
          </div>
          <button type="button" className="text-sm text-slate-500 hover:text-slate-900" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="h-[70vh] overflow-hidden rounded-b-3xl">
          <iframe title="Email preview" srcDoc={html} className="h-full w-full border-0" />
        </div>
      </div>
    </div>
  );
}
