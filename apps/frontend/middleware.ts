import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirigir "/" según estado de autenticación
  if (pathname === "/") {
    // Verificar si hay token en cookie (si existe)
    const tokenCookie = req.cookies.get("access_token");
    const authCookie = req.cookies.get("pmd-auth-storage");

    // Si hay token o cookie de auth, redirigir a dashboard
    if (tokenCookie || authCookie) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Si no hay token, redirigir a login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Para otras rutas, continuar normalmente
  // El control de acceso queda delegado a componentes client-side (ProtectedRoute)
  return NextResponse.next();
}

// Matcher: solo interceptar "/"
export const config = {
  matcher: "/",
};
