import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/env";

const BACKEND_URL = getBackendUrl();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/work-documents/${id}/download`, {
      method: "GET",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    if (!response.ok) {
      // Si es una redirección (para cloud storage), seguirla
      if (response.status === 302 || response.status === 301) {
        const location = response.headers.get("location");
        if (location) {
          return NextResponse.redirect(location);
        }
      }
      
      const errorText = await response.text();
      console.error("[API WORK-DOCUMENTS DOWNLOAD ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al descargar el archivo", message: errorText },
        { status: response.status }
      );
    }

    // Obtener el nombre del archivo del header Content-Disposition
    const contentDisposition = response.headers.get("content-disposition");
    let fileName = "documento";
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
      if (fileNameMatch) {
        fileName = fileNameMatch[1];
      }
    }

    // Obtener el blob del archivo
    const blob = await response.blob();

    // Retornar el archivo con el nombre correcto
    return new NextResponse(blob, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("[API WORK-DOCUMENTS DOWNLOAD ERROR]", error);
    return NextResponse.json(
      { error: "File download failed" },
      { status: 500 }
    );
  }
}

