"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EditProfileModal } from "./EditProfileModal";
import { ChangePasswordModal } from "./ChangePasswordModal";

export function UserActionsSection() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleEditProfile = () => {
    setIsEditProfileOpen(true);
  };

  const handleChangePassword = () => {
    setIsChangePasswordOpen(true);
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Opciones de Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleEditProfile}
          >
            Editar perfil
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleChangePassword}
          >
            Cambiar contraseña
          </Button>

          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleLogout}
            >
              Cerrar sesión
            </Button>
          </div>

          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={handleBackToDashboard}
          >
            Volver al Dashboard
          </Button>
        </CardContent>
      </Card>

      {/* Renderizar modales fuera del Card usando Fragment */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
}

