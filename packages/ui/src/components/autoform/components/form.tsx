import type React from "react";

export const Form: React.FC<React.ComponentProps<"form">> = ({ children, className, ...props }) => (
  <form className={className ?? "space-y-4"} {...props}>
    {children}
  </form>
);
