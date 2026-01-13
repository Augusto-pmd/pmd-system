import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/env";

const BACKEND_URL = getBackendUrl();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/api/rubrics/${params.id}`, {
      method: "GET",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API RUBRICS GET BY ID ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al obtener la rúbrica", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API RUBRICS GET BY ID ERROR]", error);
    return NextResponse.json(
      { error: "Rubric fetch failed" },
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
    const csrfToken = request.headers.get("x-csrf-token");
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
      console.error("[API RUBRICS PATCH] Invalid JSON body:", bodyText);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const headers: HeadersInit = {
      Authorization: authHeader ?? "",
      "Content-Type": "application/json",
    };

    // Agregar CSRF token si está presente
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

    const response = await fetch(`${BACKEND_URL}/api/rubrics/${params.id}`, {
      method: "PATCH",
      headers,
      body: bodyText,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API RUBRICS PATCH ERROR]", {
        status: response.status,
        statusText: response.statusText,
        url: `${BACKEND_URL}/api/rubrics/${params.id}`,
        error: errorText,
      });
      return NextResponse.json(
        { error: "Error al actualizar la rúbrica", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API RUBRICS PATCH ERROR]", error);
    return NextResponse.json(
      { error: "Rubric update failed" },
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
    const csrfToken = request.headers.get("x-csrf-token");

    const headers: HeadersInit = {
      Authorization: authHeader ?? "",
    };

    // Agregar CSRF token si está presente
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

    const response = await fetch(`${BACKEND_URL}/api/rubrics/${params.id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API RUBRICS DELETE ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al eliminar la rúbrica", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API RUBRICS DELETE ERROR]", error);
    return NextResponse.json(
      { error: "Rubric delete failed" },
      { status: 500 }
    );
  }
}
