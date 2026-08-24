import * as React from "react";

export const TooltipProvider: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children }) => {
  return <>{children}</>;
};

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="relative group/tooltip inline-block">{children}</div>;
};

export const TooltipTrigger: React.FC<{ children: React.ReactNode; asChild?: boolean }> = ({ children }) => {
  return <>{children}</>;
};

export const TooltipContent: React.FC<{ children: React.ReactNode; side?: string; className?: string }> = ({ children, className = "" }) => {
  return (
    <div className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover/tooltip:flex z-50 rounded-md bg-slate-900 px-2.5 py-1 text-xs text-white shadow-md dark:bg-slate-800 whitespace-nowrap pointer-events-none ${className}`}>
      {children}
    </div>
  );
};
