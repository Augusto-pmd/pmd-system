"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { UserInfoSection } from "@/components/settings/UserInfoSection";
import { UserActionsSection } from "@/components/settings/UserActionsSection";
import { RecentActivitySection } from "@/components/settings/RecentActivitySection";
import { BotonVolver } from "@/components/ui/BotonVolver";

function SettingsContent() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <div>
        <BotonVolver />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Configuración</h1>
        <p className="text-gray-600">Preferencias y datos del usuario</p>
      </div>

      {/* Sección principal: Datos del usuario */}
      <UserInfoSection user={user} />

      {/* Grid de secciones secundarias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opciones de cuenta */}
        <UserActionsSection />

        {/* Actividad reciente */}
        <RecentActivitySection />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

