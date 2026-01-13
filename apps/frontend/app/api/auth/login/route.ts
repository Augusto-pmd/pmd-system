import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/env";

export async function POST(request: Request) {
  try {
    // Read body as text (NO parsear con request.json())
    const bodyText = await request.text();
    
    // Validar que el body no esté vacío
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
      console.error("[API AUTH LOGIN] Invalid JSON body:", bodyText);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Build target URL using environment variable
    const backendUrl = getBackendUrl();
    // El backend tiene el prefijo /api configurado en main.ts
    const targetUrl = `${backendUrl}/api/auth/login`;

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Forward request to backend (forwardear el texto original, NO re-stringificar)
    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: bodyText, // Forwardear el texto original tal cual
    });

    // Read response as text first
    const responseText = await response.text();

    // Try to parse JSON safely
    let responseBody;
    try {
      responseBody = responseText ? JSON.parse(responseText) : {};
    } catch (jsonError) {
      // If JSON parsing fails, return the text as error message
      return NextResponse.json(
        {
          error: "Invalid response from backend",
          message: responseText || "Empty response",
        },
        { status: response.status || 500 }
      );
    }

    // Propagate backend status code (200, 401, etc.)
    return NextResponse.json(responseBody, { status: response.status });
  } catch (error) {
    console.error("[Login API Error]", error);
    return NextResponse.json(
      {
        error: "Login error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
