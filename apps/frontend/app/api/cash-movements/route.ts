import { NextResponse } from "next/server";

import { getBackendUrl } from "@/lib/env";

const BACKEND_URL = getBackendUrl();

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const cashboxId = searchParams.get("cashboxId");

    let url = `${BACKEND_URL}/api/cash-movements`;
    if (cashboxId) {
      url += `?cashboxId=${encodeURIComponent(cashboxId)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API CASH-MOVEMENTS GET ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al obtener los movimientos", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : [];

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API CASH-MOVEMENTS GET ERROR]", error);
    return NextResponse.json(
      { error: "Cash movements fetch failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
      console.error("[API CASH-MOVEMENTS POST] Invalid JSON body:", bodyText);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/cash-movements`, {
      method: "POST",
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
    console.error("[API CASH-MOVEMENTS POST ERROR]", error);
    return NextResponse.json(
      { error: "Cash movement create failed" },
      { status: 500 }
    );
  }
}

