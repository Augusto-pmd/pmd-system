import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/env";

const BACKEND_URL = getBackendUrl();

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";

    const queryString = new URLSearchParams({ page, limit }).toString();

    const response = await fetch(`${BACKEND_URL}/api/audit?${queryString}`, {
      method: "GET",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API AUDIT GET ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al obtener los logs de auditoría", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API AUDIT GET ERROR]", error);
    return NextResponse.json(
      { error: "Audit logs fetch failed" },
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

    let body: any;
    try {
      body = JSON.parse(bodyText);
    } catch (parseError) {
      console.error("[API AUDIT POST] Invalid JSON body:", bodyText);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validar campos requeridos
    if (!body.action || !body.module) {
      return NextResponse.json(
        { error: "action and module are required" },
        { status: 400 }
      );
    }

    // Construir payload SOLO con campos válidos del DTO del backend
    // El backend rechaza propiedades adicionales, así que debemos ser estrictos
    // Solo incluir propiedades que existen en CreateAuditLogDto
    const auditPayload: {
      action: string;
      module: string;
      user_id?: string;
      entity_id?: string;
      entity_type?: string;
      previous_value?: Record<string, any>;
      new_value?: Record<string, any>;
      ip_address?: string;
      user_agent?: string;
      criticality?: string;
    } = {
      action: String(body.action),
      module: String(body.module),
    };

    // Mapear user/userId a user_id (solo si existe)
    if (body.user_id) {
      auditPayload.user_id = body.user_id;
    } else if (body.user) {
      auditPayload.user_id = body.user;
    } else if (body.userId) {
      auditPayload.user_id = body.userId;
    }

    // Mapear entityId a entity_id (solo si existe)
    if (body.entity_id) {
      auditPayload.entity_id = body.entity_id;
    } else if (body.entityId) {
      auditPayload.entity_id = body.entityId;
    }

    // Mapear entity a entity_type (solo si existe)
    if (body.entity_type) {
      auditPayload.entity_type = body.entity_type;
    } else if (body.entity && typeof body.entity === 'string') {
      auditPayload.entity_type = body.entity;
    }

    // Mapear before a previous_value (solo si existe)
    if (body.previous_value !== undefined && body.previous_value !== null) {
      auditPayload.previous_value = body.previous_value;
    } else if (body.before !== undefined && body.before !== null) {
      auditPayload.previous_value = body.before;
    }

    // Mapear after a new_value (solo si existe)
    if (body.new_value !== undefined && body.new_value !== null) {
      auditPayload.new_value = body.new_value;
    } else if (body.after !== undefined && body.after !== null) {
      auditPayload.new_value = body.after;
    }

    // Campos opcionales que pueden venir directamente en snake_case
    if (body.ip_address !== undefined && body.ip_address !== null) {
      auditPayload.ip_address = body.ip_address;
    }
    if (body.user_agent !== undefined && body.user_agent !== null) {
      auditPayload.user_agent = body.user_agent;
    }
    if (body.criticality !== undefined && body.criticality !== null) {
      auditPayload.criticality = body.criticality;
    }

    // NO incluir campos adicionales como: user, userId, userName, timestamp, details, etc.
    // Solo se envían los campos definidos en CreateAuditLogDto

    // Preparar headers incluyendo CSRF token si está presente
    const headers: Record<string, string> = {
      Authorization: authHeader ?? "",
      "Content-Type": "application/json",
    };
    
    // Agregar CSRF token si está presente en el request
    const csrfToken = request.headers.get("x-csrf-token");
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

    const response = await fetch(`${BACKEND_URL}/api/audit`, {
      method: "POST",
      headers,
      body: JSON.stringify(auditPayload),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API AUDIT POST ERROR]", error);
    return NextResponse.json(
      { error: "Audit log creation failed" },
      { status: 500 }
    );
  }
}
