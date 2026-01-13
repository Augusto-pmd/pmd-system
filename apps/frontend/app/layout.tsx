import "../styles/ui-system.css";
import "../styles/motion.css";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PMD Management System",
  description: "Sistema de gestión PMD Arquitectura",
  icons: {
    icon: "/logo-pmd.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

