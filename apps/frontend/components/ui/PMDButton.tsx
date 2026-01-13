"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PMDButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "outline";
}

export function PMDButton({
  children,
  variant = "primary",
  className,
  ...props
}: PMDButtonProps) {
  const baseStyles =
    "font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[#2A4D8F] text-white hover:bg-[#1f3a68] shadow-md hover:shadow-lg px-8 py-4",
    outline:
      "border-2 border-[#2A4D8F] text-[#2A4D8F] hover:bg-[#2A4D8F] hover:text-white px-8 py-4",
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

