import { createContext, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type AccordionType = "single" | "multiple";

interface AccordionContextValue {
  type: AccordionType;
  openValues: string[];
  toggleValue: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

interface AccordionProps {
  children: React.ReactNode;
  type?: AccordionType;
  defaultValue?: string | string[];
  className?: string;
}

export function Accordion({ children, className, type = "single", defaultValue }: AccordionProps) {
  const initial = useMemo(() => {
    if (!defaultValue) return [] as string[];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  }, [defaultValue]);

  const [openValues, setOpenValues] = useState<string[]>(initial);

  const toggleValue = (value: string) => {
    setOpenValues((prev) => {
      if (type === "single") {
        return prev[0] === value ? [] : [value];
      }
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
  };

  return (
    <AccordionContext.Provider value={{ type, openValues, toggleValue }}>
      <div className={cn("space-y-3", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white shadow-sm", className)} data-value={value}>
      {children}
    </div>
  );
}

interface TriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  value: string;
}

export function AccordionTrigger({ value, children, className, ...props }: TriggerProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("AccordionTrigger must be used within Accordion");
  const isOpen = context.openValues.includes(value);

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800",
        className
      )}
      onClick={() => context.toggleValue(value)}
      {...props}
    >
      <span>{children}</span>
      <span className="text-xs text-slate-500">{isOpen ? "Hide" : "Show"}</span>
    </button>
  );
}

interface ContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionContent({ value, children, className }: ContentProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("AccordionContent must be used within Accordion");
  const isOpen = context.openValues.includes(value);

  return (
    <div className={cn("px-4 pb-4", !isOpen && "hidden", className)}>
      {children}
    </div>
  );
}
