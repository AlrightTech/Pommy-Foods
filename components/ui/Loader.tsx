import React from "react";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = "md", 
  text = "Loading...",
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-base/80 backdrop-blur-sm z-50"
    : "flex items-center justify-center min-h-[400px]";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 
            className={`${sizeClasses[size]} animate-spin text-primary-600`}
          />
          <div className={`absolute inset-0 ${sizeClasses[size]} animate-ping text-primary-400 opacity-20`}>
            <Loader2 className="w-full h-full" />
          </div>
        </div>
        {text && (
          <p className="text-sm font-body text-neutral-600 animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

