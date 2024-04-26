import React from "react";
import { cn } from "../../lib/utils";

const Container = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-[calc(max(5%,min(25%,50%-600px)))]", className)} {...props}></div>
));

Container.displayName = "Container";

export { Container };
