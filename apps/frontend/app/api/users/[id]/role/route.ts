import { NextResponse } from "next/server";

import { getBackendUrl } from "@/lib/env";

const BACKEND_URL = getBackendUrl();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/api/users/${params.id}/role`, {
      method: "GET",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API USERS ROLE GET ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al obtener el rol del usuario", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API USERS ROLE GET ERROR]", error);
    return NextResponse.json(
      { error: "User role fetch failed" },
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
    let body: any;
    try {
      body = JSON.parse(bodyText);
    } catch (parseError) {
      console.error("[API USERS ROLE PATCH] Invalid JSON body:", bodyText);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Mapear roleId (camelCase) a role_id (snake_case) que espera el backend
    const backendPayload: { role_id: string } = {
      role_id: body.role_id || body.roleId || "",
    };

    if (!backendPayload.role_id) {
      return NextResponse.json(
        { error: "role_id or roleId is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/users/${params.id}/role`, {
      method: "PATCH",
      headers: {
        Authorization: authHeader ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload), // Enviar con el formato correcto
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API USERS ROLE PATCH ERROR]", error);
    return NextResponse.json(
      { error: "User role update failed" },
      { status: 500 }
    );
  }
}

