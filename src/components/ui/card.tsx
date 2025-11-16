import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={cn("rounded-3xl border border-slate-200 bg-white p-4 shadow-sm", className)}>{children}</div>;
}
