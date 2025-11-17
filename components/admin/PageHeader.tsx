import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8", className)}>
      <div className="flex-1">
        <h1 className="font-semibold text-3xl md:text-4xl font-body text-neutral-900 mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-neutral-600 font-body text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};


