import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(({ className, ...props }, ref) => {
  return (
    <input
      type="range"
      ref={ref}
      className={cn(
        "h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#3F51B5]",
        className
      )}
      {...props}
    />
  );
});

Slider.displayName = "Slider";
