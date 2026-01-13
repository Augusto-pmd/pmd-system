import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./table.module.css";

interface TableContainerProps {
  children: ReactNode;
  className?: string;
}

export function TableContainer({ children, className }: TableContainerProps) {
  return (
    <div className={cn(styles.container, className)}>
      {children}
    </div>
  );
}

