"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { CurrentRate } from "@/components/exchange-rates/CurrentRate";

// Mapeo de rutas a títulos
const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/works": "Obras",
  "/suppliers": "Proveedores",
  "/cashbox": "Cajas",
  "/cash-movements": "Movimientos de Caja",
  "/documents": "Documentos",
  "/accounting": "Contabilidad",
  "/alerts": "Alertas",
  "/audit": "Auditoría",
  "/settings": "Configuración",
  "/settings/users": "Usuarios",
  "/roles": "Roles",
};

export function Topbar() {
  const pathname = usePathname();
  const title = routeTitles[pathname || ""] || "";
  
  return <Header title={title} />;
}
