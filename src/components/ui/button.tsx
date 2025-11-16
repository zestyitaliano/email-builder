import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#3F51B5] text-white hover:bg-[#35449a]",
  outline: "border border-[#3F51B5] text-[#3F51B5] hover:bg-[#dfe3f5]",
  ghost: "text-[#3F51B5] hover:bg-[#dfe3f5]",
  danger: "bg-[#e11d48] text-white hover:bg-[#be123c]"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3F51B5] focus-visible:ring-offset-[#E8EAF6] disabled:cursor-not-allowed disabled:opacity-60",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
