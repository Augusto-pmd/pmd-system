"use client";

import { useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { Card, CardTitle, CardContent } from "@/components/ui/Card";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  className?: string;
}

export function ModuleCard({ title, description, icon: Icon, route, className }: ModuleCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(route);
  };

  return (
    <Card onClick={handleClick} className={className}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon 
            className="w-5 h-5"
            style={{ color: "var(--apple-text-primary)" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <CardTitle>{title}</CardTitle>
          <CardContent style={{ padding: 0, margin: 0 }}>
            <p style={{ 
              fontSize: "13px", 
              color: "var(--apple-text-secondary)", 
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}>
              {description}
            </p>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
