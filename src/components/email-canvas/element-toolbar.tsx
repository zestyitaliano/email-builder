import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import type { CanvasElementType } from "@/lib/types";

interface ElementToolbarProps {
  onAddElement: (type: CanvasElementType) => void;
}

const icons: Record<CanvasElementType, JSX.Element> = {
  text: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" fill="none" strokeWidth={1.5}>
      <path d="M5 6h14" />
      <path d="M8 6v12" />
      <path d="M16 6v12" />
      <path d="M4 18h16" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" fill="none" strokeWidth={1.5}>
      <rect x={4} y={5} width={16} height={14} rx={2} />
      <circle cx={9} cy={9} r={1.5} />
      <path d="M6 15l3-3 3 3 4-4 2 2" />
    </svg>
  ),
  button: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" fill="none" strokeWidth={1.5}>
      <rect x={4} y={9} width={16} height={6} rx={3} />
      <path d="M7 12h10" />
    </svg>
  )
};

export function ElementToolbar({ onAddElement }: ElementToolbarProps) {
  const buttons: { type: CanvasElementType; label: string }[] = [
    { type: "text", label: "Text" },
    { type: "image", label: "Image" },
    { type: "button", label: "Button" }
  ];

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Elements</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {buttons.map((button) => (
          <Tooltip key={button.type} content={`Add ${button.label}`}>
            <Button
              variant="outline"
              className="flex h-12 flex-col gap-1 rounded-2xl bg-[#F8F9FF] text-xs text-slate-700"
              onClick={() => onAddElement(button.type)}
            >
              {icons[button.type]}
              {button.label}
            </Button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
