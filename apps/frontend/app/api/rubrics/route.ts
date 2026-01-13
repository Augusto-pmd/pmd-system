import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/env";

const BACKEND_URL = getBackendUrl();

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    const response = await fetch(`${BACKEND_URL}/api/rubrics`, {
      method: "GET",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API RUBRICS GET ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al obtener las rúbricas", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : [];

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API RUBRICS GET ERROR]", error);
    return NextResponse.json(
      { error: "Rubrics fetch failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
      console.error("[API RUBRICS POST] Invalid JSON body:", bodyText);
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

    const response = await fetch(`${BACKEND_URL}/api/rubrics`, {
      method: "POST",
      headers,
      body: bodyText,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API RUBRICS POST ERROR]", {
        status: response.status,
        statusText: response.statusText,
        url: `${BACKEND_URL}/api/rubrics`,
        error: errorText,
      });
      return NextResponse.json(
        { error: "Error al crear la rúbrica", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API RUBRICS POST ERROR]", error);
    return NextResponse.json(
      { error: "Rubric create failed" },
      { status: 500 }
    );
  }
}
