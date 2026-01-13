import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { getBackendUrl } from "@/lib/env";

const BACKEND_URL = getBackendUrl();

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    const response = await fetch(`${BACKEND_URL}/api/documents`, {
      method: "GET",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    // Aseguramos que la respuesta no esté vacía y que sea JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API DOCUMENTS ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al obtener los documentos", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : [];

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API DOCUMENTS GET ERROR]", error);
    return NextResponse.json(
      { error: "Documents fetch failed" },
      { status: 500 }
    );
  }
}

