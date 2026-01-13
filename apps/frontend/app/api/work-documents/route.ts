import { NextResponse } from "next/server";

import { getBackendUrl } from "@/lib/env";

const BACKEND_URL = getBackendUrl();

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    const response = await fetch(`${BACKEND_URL}/api/work-documents`, {
      method: "GET",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    // Aseguramos que la respuesta no esté vacía y que sea JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API WORK-DOCUMENTS ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al obtener los documentos de obra", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : [];

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API WORK-DOCUMENTS GET ERROR]", error);
    return NextResponse.json(
      { error: "Work documents fetch failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const csrfToken = request.headers.get("x-csrf-token");
    const contentType = request.headers.get("content-type") || "";

    // Detectar si es FormData (multipart/form-data)
    // axios puede eliminar el Content-Type, así que verificamos si contiene "multipart"
    // También intentamos leer como FormData y si funciona, es FormData
    const isFormData = contentType.includes("multipart");

    let body: BodyInit;
    const headers: HeadersInit = {
      Authorization: authHeader ?? "",
    };

    // Agregar CSRF token si está presente
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

    if (isFormData) {
      // Para FormData, usar el body directamente sin parsear
      body = await request.formData();
      // No establecer Content-Type para FormData, dejar que fetch lo maneje automáticamente
    } else {
      // Para JSON, parsear y validar
      const bodyText = await request.text();
      
      if (!bodyText || bodyText.trim() === "") {
        return NextResponse.json(
          { error: "Request body is required" },
          { status: 400 }
        );
      }

      try {
        JSON.parse(bodyText);
        headers["Content-Type"] = "application/json";
        body = bodyText;
      } catch (parseError) {
        console.error("[API WORK-DOCUMENTS POST] Invalid JSON body:", bodyText);
        return NextResponse.json(
          { error: "Invalid JSON in request body" },
          { status: 400 }
        );
      }
    }

    const response = await fetch(`${BACKEND_URL}/api/work-documents`, {
      method: "POST",
      headers,
      body,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API WORK-DOCUMENTS POST ERROR]", error);
    return NextResponse.json(
      { error: "Work documents create failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const csrfToken = request.headers.get("x-csrf-token");
    const contentType = request.headers.get("content-type") || "";

    // Detectar si es FormData (multipart/form-data)
    // axios puede eliminar el Content-Type, así que verificamos si contiene "multipart"
    const isFormData = contentType.includes("multipart");

    let body: BodyInit;
    const headers: HeadersInit = {
      Authorization: authHeader ?? "",
    };

    // Agregar CSRF token si está presente
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

    // Intentar detectar FormData: si el Content-Type contiene "multipart" o si podemos leerlo como FormData
    let isFormDataDetected = isFormData;
    if (!isFormDataDetected) {
      // Intentar leer como FormData para verificar (sin consumir el body)
      try {
        const clonedRequest = request.clone();
        const testFormData = await clonedRequest.formData();
        // Si llegamos aquí, es FormData
        isFormDataDetected = true;
      } catch {
        // No es FormData, continuar con JSON
        isFormDataDetected = false;
      }
    }

    if (isFormDataDetected) {
      // Para FormData, usar el body directamente sin parsear
      body = await request.formData();
      // No establecer Content-Type para FormData, dejar que fetch lo maneje automáticamente
    } else {
      // Para JSON, parsear y validar
      const bodyText = await request.text();
      
      if (!bodyText || bodyText.trim() === "") {
        return NextResponse.json(
          { error: "Request body is required" },
          { status: 400 }
        );
      }

      try {
        JSON.parse(bodyText);
        headers["Content-Type"] = "application/json";
        body = bodyText;
      } catch (parseError) {
        console.error("[API WORK-DOCUMENTS PATCH] Invalid JSON body:", bodyText);
        return NextResponse.json(
          { error: "Invalid JSON in request body" },
          { status: 400 }
        );
      }
    }

    const response = await fetch(`${BACKEND_URL}/api/work-documents`, {
      method: "PATCH",
      headers,
      body,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API WORK-DOCUMENTS PATCH ERROR]", error);
    return NextResponse.json(
      { error: "Work documents update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.text();

    const response = await fetch(`${BACKEND_URL}/api/work-documents`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader ?? "",
        "Content-Type": "application/json",
      },
      body,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API WORK-DOCUMENTS DELETE ERROR]", error);
    return NextResponse.json(
      { error: "Work documents delete failed" },
      { status: 500 }
    );
  }
}

