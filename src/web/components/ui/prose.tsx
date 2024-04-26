import React from "react";

import { cn } from "../../lib/utils";

const Prose = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col items-center", className)} {...props}>
        <div className="prose">{children}</div>
    </div>
));

Prose.displayName = "Prose";

export { Prose };
