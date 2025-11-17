import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "defaultValue"> {
  value: number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, onValueCommit, ...props }, ref) => {
    return (
      <input
        type="range"
        ref={ref}
        value={value[0] ?? 0}
        onChange={(event) => onValueChange?.([Number(event.target.value)])}
        onMouseUp={(event) => onValueCommit?.([Number(event.currentTarget.value)])}
        onTouchEnd={(event) => onValueCommit?.([Number(event.currentTarget.value)])}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#3F51B5]",
          className
        )}
        {...props}
      />
    );
  }
);

Slider.displayName = "Slider";
