import { NextResponse } from "next/server";

import { getBackendUrl } from "@/lib/env";

const BACKEND_URL = getBackendUrl();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/api/roles/${params.id}`, {
      method: "GET",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API ROLES GET BY ID ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al obtener el rol", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API ROLES GET BY ID ERROR]", error);
    return NextResponse.json(
      { error: "Role fetch failed" },
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
      console.error("[API ROLES PATCH] Invalid JSON body:", bodyText);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const csrfToken = request.headers.get("x-csrf-token");
    const headers: HeadersInit = {
      Authorization: authHeader ?? "",
      "Content-Type": "application/json",
    };

    // Agregar CSRF token si está presente
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

    const response = await fetch(`${BACKEND_URL}/api/roles/${params.id}`, {
      method: "PATCH",
      headers,
      body: bodyText, // Forwardear el texto original tal cual
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API ROLES PATCH ERROR]", {
        status: response.status,
        statusText: response.statusText,
        url: `${BACKEND_URL}/api/roles/${params.id}`,
        error: errorText,
      });
      return NextResponse.json(
        { error: "Error al actualizar el rol", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API ROLES PATCH ERROR]", error);
    return NextResponse.json(
      { error: "Role update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");

    const response = await fetch(`${BACKEND_URL}/api/roles/${params.id}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API ROLES DELETE ERROR]", error);
    return NextResponse.json(
      { error: "Role delete failed" },
      { status: 500 }
    );
  }
}

