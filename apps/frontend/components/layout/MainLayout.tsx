"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Topbar } from "./Topbar";
import SidebarToggle from "./SidebarToggle";
// Importar script de auditoría para que esté disponible globalmente
import "@/lib/audit-permissions";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[var(--apple-canvas)] font-[Inter,system-ui,sans-serif]">
      {/* Mobile Sidebar Toggle Button - Fixed and always visible */}
      <SidebarToggle
        open={mobileSidebarOpen}
        onToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Ancho fijo en desktop, ocupa espacio real */}
      <Sidebar 
        mobileOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
      />
      
      {/* Main Content Area - Ocupa todo el espacio restante */}
      <main className="flex-1 w-full min-w-0 flex flex-col">
        {/* Header - position: relative, parte del flujo normal */}
        <Topbar />
        
        {/* Content Wrapper - Padding interno consistente */}
        <section className="flex-1 w-full px-6 py-4 overflow-y-auto overflow-x-hidden">
          {children}
        </section>
      </main>
    </div>
  );
}
