"use client";

interface UserAvatarProps {
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function UserAvatar({ name, size = "lg", className = "" }: UserAvatarProps) {
  const getInitial = (name: string | undefined): string => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-xl",
    lg: "w-24 h-24 text-3xl",
    xl: "w-32 h-32 text-4xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-pmd-darkBlue via-pmd-mediumBlue to-pmd-darkBlue flex items-center justify-center text-pmd-white font-bold shadow-lg border-4 border-white ${className}`}
    >
      {getInitial(name)}
    </div>
  );
}

