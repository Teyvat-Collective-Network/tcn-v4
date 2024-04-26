import React from "react";
import { cn } from "../../lib/utils";

const Panel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { highlight?: boolean }>(({ className, highlight, ...props }, ref) => (
    <div ref={ref} className={cn(`${highlight ? "bg-hl" : "bg-muted-foreground/10"} rounded p-4`, className)} {...props}></div>
));

Panel.displayName = "Panel";

export { Panel };
