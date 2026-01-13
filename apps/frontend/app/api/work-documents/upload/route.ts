import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/env";

const BACKEND_URL = getBackendUrl();

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const csrfToken = request.headers.get("x-csrf-token");

    // Obtener FormData del request
    const formData = await request.formData();
    
    const headers: HeadersInit = {
      Authorization: authHeader ?? "",
    };

    // Agregar CSRF token si está presente
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

    // Crear nuevo FormData para forwardear al backend
    const backendFormData = new FormData();
    const file = formData.get("file") as File;
    const workId = formData.get("work_id") as string;
    const name = formData.get("name") as string;

    if (file) {
      backendFormData.append("file", file);
    }
    if (workId) {
      backendFormData.append("work_id", workId);
    }
    if (name) {
      backendFormData.append("name", name);
    }

    const response = await fetch(`${BACKEND_URL}/api/work-documents/upload`, {
      method: "POST",
      headers,
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API WORK-DOCUMENTS UPLOAD ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al subir el archivo", message: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API WORK-DOCUMENTS UPLOAD ERROR]", error);
    return NextResponse.json(
      { error: "File upload failed" },
      { status: 500 }
    );
  }
}

