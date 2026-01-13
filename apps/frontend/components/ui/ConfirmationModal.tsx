"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmationModalProps) {
  const confirmButtonStyle: React.CSSProperties =
    variant === "danger"
      ? {
          color: "rgba(255,59,48,1)",
          backgroundColor: "transparent",
          border: "none",
          padding: 0,
        }
      : {
          color: "var(--apple-blue)",
          backgroundColor: "transparent",
          border: "none",
          padding: 0,
        };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={description}
      size="sm"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            style={{ padding: "0 var(--space-md)" }}
          >
            {cancelText}
          </Button>
          <Button
            variant="ghost"
            onClick={onConfirm}
            disabled={isLoading}
            style={confirmButtonStyle}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </>
      }
    >
      <div />
    </Modal>
  );
}

