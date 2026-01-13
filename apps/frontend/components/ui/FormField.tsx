import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./form.module.css";

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  required,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn(styles.formField, className)}>
      {label && (
        <label
          className={cn(styles.label, required && styles.labelRequired)}
        >
          {label}
        </label>
      )}
      {children}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
}

export function InputField({
  label,
  required,
  error,
  className,
  ...props
}: InputFieldProps) {
  return (
    <FormField label={label} required={required} error={error}>
      <input
        className={cn(styles.input, error && styles.inputError, className)}
        {...props}
      />
    </FormField>
  );
}

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function SelectField({
  label,
  required,
  error,
  options,
  className,
  value,
  ...props
}: SelectFieldProps) {
  // Asegurar que value nunca sea null o undefined
  const safeValue = value === null || value === undefined ? "" : value;
  
  return (
    <FormField label={label} required={required} error={error}>
      <select
        className={cn(styles.select, error && styles.inputError, className)}
        value={safeValue}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
}

export function TextareaField({
  label,
  required,
  error,
  className,
  value,
  ...props
}: TextareaFieldProps) {
  // Asegurar que value nunca sea null o undefined
  const safeValue = value === null || value === undefined ? "" : value;
  
  return (
    <FormField label={label} required={required} error={error}>
      <textarea
        className={cn(
          styles.textarea,
          error && styles.inputError,
          className
        )}
        value={safeValue}
        {...props}
      />
    </FormField>
  );
}

