import { NextResponse } from "next/server";

import { getBackendUrl } from "@/lib/env";

const BACKEND_URL = getBackendUrl();

// Esta ruta debe ser siempre dinámica porque usa request.headers
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: "GET",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API USERS ME ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al obtener el usuario", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API USERS ME GET ERROR]", error);
    return NextResponse.json(
      { error: "User fetch failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const csrfToken = request.headers.get("X-CSRF-Token");
    const bodyText = await request.text();
    
    // Validar que el body no esté vacío y sea JSON válido
    if (!bodyText || bodyText.trim() === "") {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    // Verificar que sea JSON válido antes de forwardear
    try {
      JSON.parse(bodyText);
    } catch (parseError) {
      console.error("[API USERS ME PATCH] Invalid JSON body:", bodyText);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const headers: HeadersInit = {
      Authorization: authHeader ?? "",
      "Content-Type": "application/json",
    };

    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

    const response = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: "PATCH",
      headers,
      body: bodyText,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API USERS ME PATCH ERROR]", error);
    return NextResponse.json(
      { error: "Profile update failed" },
      { status: 500 }
    );
  }
}

