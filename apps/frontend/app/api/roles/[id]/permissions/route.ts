import { NextResponse } from "next/server";

import { getBackendUrl } from "@/lib/env";

const BACKEND_URL = getBackendUrl();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/api/roles/${params.id}/permissions`, {
      method: "GET",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API ROLES PERMISSIONS GET ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al obtener los permisos", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : [];

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API ROLES PERMISSIONS GET ERROR]", error);
    return NextResponse.json(
      { error: "Permissions fetch failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
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
      console.error("[API ROLES PERMISSIONS PATCH] Invalid JSON body:", bodyText);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/roles/${params.id}/permissions`, {
      method: "PATCH",
      headers: {
        Authorization: authHeader ?? "",
        "Content-Type": "application/json",
      },
      body: bodyText, // Forwardear el texto original tal cual
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API ROLES PERMISSIONS PATCH ERROR]", error);
    return NextResponse.json(
      { error: "Permissions update failed" },
      { status: 500 }
    );
  }
}

