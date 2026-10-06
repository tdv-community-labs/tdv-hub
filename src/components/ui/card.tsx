import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl text-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-white/20",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card };
