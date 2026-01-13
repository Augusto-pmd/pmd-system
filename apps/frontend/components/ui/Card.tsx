import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./card.module.css";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, className, style, onClick }: CardProps) {
  return (
    <div 
      className={cn(styles.card, onClick && styles.clickable, className)}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function CardHeader({ children, className, style }: CardHeaderProps) {
  return (
    <div className={cn(styles.header, className)} style={style}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: "h2" | "h3" | "h4";
}

export function CardTitle({ children, className, style, as: Component = "h3" }: CardTitleProps) {
  return (
    <Component className={cn(styles.title, className)} style={style}>
      {children}
    </Component>
  );
}

interface CardSubtitleProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function CardSubtitle({ children, className, style }: CardSubtitleProps) {
  return (
    <p className={cn(styles.subtitle, className)} style={style}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function CardContent({ children, className, style }: CardContentProps) {
  return (
    <div className={cn(styles.content, className)} style={style}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function CardFooter({ children, className, style }: CardFooterProps) {
  return (
    <div className={cn(styles.footer, className)} style={style}>
      {children}
    </div>
  );
}
