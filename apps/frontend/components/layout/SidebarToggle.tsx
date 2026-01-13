"use client";

import { Menu, X } from "lucide-react";

interface SidebarToggleProps {
  onToggle: () => void;
  open: boolean;
}

export default function SidebarToggle({ onToggle, open }: SidebarToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="fixed top-4 left-4 z-[9999] p-4 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all active:scale-95 shadow-[0_4px_10px_rgba(0,0,0,0.25)] md:hidden"
      style={{ minWidth: "48px", minHeight: "48px" }}
      aria-label={open ? "Cerrar menú" : "Abrir menú"}
    >
      {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
}

