"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ children, content, side = "bottom" }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-2 text-xs text-white bg-gray-900 rounded-md shadow-lg w-64 pointer-events-none",
            sideClasses[side]
          )}
        >
          {content}
          <div
            className={cn(
              "absolute w-2 h-2 bg-gray-900 transform rotate-45",
              side === "bottom" && "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
              side === "top" && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
              side === "right" && "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
              side === "left" && "right-0 top-1/2 translate-x-1/2 -translate-y-1/2"
            )}
          />
        </div>
      )}
    </div>
  );
}
