import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./table.module.css";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={cn(styles.table, className)}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={cn(styles.header, className)}>
      {children}
    </thead>
  );
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  isSelected?: boolean;
}

export function TableRow({ children, className, style, onClick, isSelected }: TableRowProps) {
  return (
    <tr 
      className={cn(
        styles.row,
        onClick && styles.clickable,
        isSelected && styles.selected,
        className
      )}
      style={style}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}

export function TableHead({ children, className, align = "left" }: TableHeadProps) {
  return (
    <th 
      className={cn(styles.head, className)}
      style={{ textAlign: align }}
    >
      {children}
    </th>
  );
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
  return (
    <tbody className={cn(styles.body, className)}>
      {children}
    </tbody>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  style?: React.CSSProperties;
}

export function TableCell({ children, className, align = "left", style }: TableCellProps) {
  return (
    <td 
      className={cn(styles.cell, className)}
      style={{ textAlign: align, ...style }}
    >
      {children}
    </td>
  );
}

interface TableEmptyProps {
  message?: string;
  className?: string;
}

export function TableEmpty({ message = "No data available", className }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={100} className={cn(styles.empty, className)}>
        {message}
      </td>
    </tr>
  );
}
