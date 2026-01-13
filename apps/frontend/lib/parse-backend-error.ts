/**
 * Helper para parsear errores del backend NestJS
 * Extrae mensajes de validación y errores de forma consistente
 */

export interface BackendError {
  message: string;
  statusCode?: number;
  error?: string;
}

/**
 * Parsea un error de axios/backend y extrae un mensaje claro para el usuario
 * @param error - Error de axios o cualquier error
 * @returns Mensaje de error parseado
 */
export function parseBackendError(error: unknown): string {
  // Si ya es un string, verificar si es un error 403 genérico
  if (typeof error === "string") {
    if (error.includes("403") || error.includes("Request failed with status code 403")) {
      return "No tiene permisos para realizar esta acción";
    }
    return error;
  }

  // Verificar si es un error de Axios con status 403
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { status?: number; data?: unknown } };
    if (axiosError.response?.status === 403) {
      // Intentar extraer mensaje del backend primero
      const responseData = axiosError.response.data;
      if (responseData && typeof responseData === "object") {
        // NestJS puede devolver el mensaje anidado: { message: { message: "..." } }
        let backendMessage: string | string[] | undefined;
        
        if ("message" in responseData) {
          const messageField = (responseData as { message: unknown }).message;
          
          // Si message es un objeto anidado (estructura NestJS)
          if (messageField && typeof messageField === "object" && !Array.isArray(messageField) && "message" in messageField) {
            backendMessage = (messageField as { message: string | string[] }).message;
          } 
          // Si message es directamente string o array
          else if (typeof messageField === "string" || Array.isArray(messageField)) {
            backendMessage = messageField;
          }
        }
        
        // Si encontramos un mensaje específico del backend, usarlo
        if (backendMessage) {
          if (typeof backendMessage === "string" && backendMessage.trim()) {
            // Si el mensaje del backend es genérico, usar nuestro mensaje
            if (backendMessage.includes("403") || backendMessage.includes("Request failed with status code 403") || 
                backendMessage === "Forbidden" || backendMessage === "ForbiddenException") {
              return "No tiene permisos para realizar esta acción";
            }
            // Traducir mensajes comunes de permisos
            return translatePermissionMessage(backendMessage);
          }
          if (Array.isArray(backendMessage) && backendMessage.length > 0) {
            return backendMessage.map(msg => translatePermissionMessage(msg)).join(". ");
          }
        }
      }
      // Si no hay mensaje específico del backend, usar mensaje genérico
      return "No tiene permisos para realizar esta acción";
    }
  }

  // Si tiene message directo, verificar si es un error 403
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    const message = error.message;
    if (message.includes("403") || message.includes("Request failed with status code 403")) {
      return "No tiene permisos para realizar esta acción";
    }
    return message;
  }

  // Intentar extraer de response.data (axios error)
  const responseData = (error && typeof error === "object" && "response" in error && typeof error.response === "object" && error.response && "data" in error.response)
    ? error.response.data
    : (error && typeof error === "object" && "data" in error)
      ? error.data
      : undefined;
  
  if (responseData && typeof responseData === "object") {
    const data = responseData as Record<string, unknown>;
    
    // Verificar si es un error 403
    if (data.statusCode === 403 || (typeof data.statusCode === "number" && data.statusCode === 403)) {
      // NestJS puede devolver el mensaje anidado: { message: { message: "..." } }
      let backendMessage: string | string[] | undefined;
      
      if ("message" in data) {
        const messageField = data.message;
        
        // Si message es un objeto anidado (estructura NestJS)
        if (messageField && typeof messageField === "object" && !Array.isArray(messageField) && "message" in messageField) {
          backendMessage = (messageField as { message: string | string[] }).message;
        } 
        // Si message es directamente string o array
        else if (typeof messageField === "string" || Array.isArray(messageField)) {
          backendMessage = messageField;
        }
      }
      
      // Si hay un mensaje específico del backend, usarlo
      if (backendMessage) {
        if (typeof backendMessage === "string" && backendMessage.trim() && !backendMessage.includes("Request failed")) {
          // Traducir mensajes comunes de permisos
          const translated = translatePermissionMessage(backendMessage);
          return translated;
        }
        if (Array.isArray(backendMessage) && backendMessage.length > 0) {
          return backendMessage.map(msg => translatePermissionMessage(msg)).join(". ");
        }
      }
      
      return "No tiene permisos para realizar esta acción";
    }
    
    // NestJS validation error: { statusCode: 400, message: string | string[] | { message: string } }
    // Manejar mensaje anidado para errores 400
    let backendMessage: string | string[] | undefined;
    
    if ("message" in data) {
      const messageField = data.message;
      
      // Si message es un objeto anidado (estructura NestJS común en errores 400)
      if (messageField && typeof messageField === "object" && !Array.isArray(messageField) && "message" in messageField) {
        backendMessage = (messageField as { message: string | string[] }).message;
      } 
      // Si message es directamente string o array
      else if (typeof messageField === "string" || Array.isArray(messageField)) {
        backendMessage = messageField;
      }
    }
    
    // Si encontramos un mensaje, procesarlo
    if (backendMessage) {
      if (Array.isArray(backendMessage)) {
        // Si es array, unir los mensajes y limpiar mensajes técnicos
        const cleanedMessages = backendMessage.map((msg: string) => {
          // Limpiar mensajes técnicos de validación
          if (msg.includes("should not exist")) {
            return msg.replace(/property (\w+) should not exist/i, "El campo '$1' no es válido");
          }
          if (msg.includes("must be one of the following values")) {
            return msg.replace(/must be one of the following values: (.+)/i, "Debe ser uno de los siguientes valores: $1");
          }
          if (msg.includes("must be")) {
            return msg.replace(/must be (.+)/i, "Debe ser $1");
          }
          return msg;
        });
        const joinedMessage = cleanedMessages.join(". ");
        // Traducir mensajes específicos de cajas
        const translated = translateCashboxMessage(joinedMessage);
        return translated !== joinedMessage ? translated : joinedMessage;
      }
      
      if (typeof backendMessage === "string" && backendMessage.trim()) {
        // Traducir mensajes específicos de cajas PRIMERO (antes de otros checks)
        const translated = translateCashboxMessage(backendMessage);
        if (translated !== backendMessage) {
          return translated;
        }
        
        // Verificar si el mensaje es un error 403 genérico
        if (backendMessage.includes("403") || backendMessage.includes("Request failed with status code 403")) {
          return "No tiene permisos para realizar esta acción";
        }
        return backendMessage;
      }
    }
    
    // Fallback: si no se encontró mensaje anidado, intentar con el campo message directo
    if (typeof data.message === "string") {
      // Verificar si el mensaje es un error 403 genérico
      if (data.message.includes("403") || data.message.includes("Request failed with status code 403")) {
        return "No tiene permisos para realizar esta acción";
      }
      return data.message;
    }

    // Si tiene error field
    if (typeof data.error === "string") {
      if (data.error.includes("403") || data.error.includes("Forbidden")) {
        return "No tiene permisos para realizar esta acción";
      }
      return data.error;
    }
  }

  // Fallback genérico - verificar si hay algún código de estado
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { status?: number } };
    const status = axiosError.response?.status;
    
    if (status === 400) {
      return "La solicitud no es válida. Por favor, verifique los datos ingresados.";
    }
    if (status === 401) {
      return "Su sesión ha expirado. Por favor, inicie sesión nuevamente.";
    }
    if (status === 404) {
      return "El recurso solicitado no fue encontrado.";
    }
    if (status === 500) {
      return "Error interno del servidor. Por favor, intente nuevamente más tarde.";
    }
    if (status === 503) {
      return "El servicio no está disponible temporalmente. Por favor, intente más tarde.";
    }
  }

  // Fallback genérico
  return "Error desconocido. Por favor, intente nuevamente.";
}

/**
 * Traduce mensajes comunes de permisos del inglés al español
 */
function translatePermissionMessage(message: string): string {
  // Mensajes comunes de permisos
  const translations: Record<string, string> = {
    "Only Direction can delete suppliers": "Solo Dirección puede eliminar proveedores",
    "Only Direction can delete works": "Solo Dirección puede eliminar obras",
    "Only Direction can delete users": "Solo Dirección puede eliminar usuarios",
    "Only Direction can delete roles": "Solo Dirección puede eliminar roles",
    "Only Direction can delete contracts": "Solo Dirección puede eliminar contratos",
    "Only Direction can delete expenses": "Solo Dirección puede eliminar gastos",
    "Only Direction can delete incomes": "Solo Dirección puede eliminar ingresos",
    "Only Direction can delete alerts": "Solo Dirección puede eliminar alertas",
    "Solo Dirección puede eliminar alertas": "Solo Dirección puede eliminar alertas",
    "You can only access your own alerts": "Solo puedes acceder a tus propias alertas",
    "Only Administration and Direction can assign alerts": "Solo Administración y Dirección pueden asignar alertas",
    "You do not have permission to resolve this alert": "No tienes permiso para resolver esta alerta",
    "Only Administration and Direction can approve suppliers": "Solo Administración y Dirección pueden aprobar proveedores",
    "Only Administration and Direction can reject suppliers": "Solo Administración y Dirección pueden rechazar proveedores",
    "Supplier does not belong to your organization": "El proveedor no pertenece a tu organización",
    "Operators cannot change supplier status": "Los operadores no pueden cambiar el estado de los proveedores",
    "Only Direction can unblock suppliers. Please contact Direction to unblock this supplier.": "Solo Dirección puede desbloquear proveedores. Por favor, contacta a Dirección para desbloquear este proveedor.",
    "Only Direction can create roles": "Solo Dirección puede crear roles",
    "Only Direction can view roles": "Solo Dirección puede ver roles",
    "Only Direction can view role permissions": "Solo Dirección puede ver los permisos de los roles",
    "Only Direction can create users": "Solo Dirección puede crear usuarios",
    "Only Direction can update user roles": "Solo Dirección puede actualizar los roles de los usuarios",
    "Only Administration and Direction can validate expenses": "Solo Administración y Dirección pueden validar gastos",
    "Expense does not belong to your organization": "El gasto no pertenece a tu organización",
    "You can only access your own expenses": "Solo puedes acceder a tus propios gastos",
    "Only Administration and Direction can edit validated expenses": "Solo Administración y Dirección pueden editar gastos validados",
    "Only Administration and Direction can reject expenses": "Solo Administración y Dirección pueden rechazar gastos",
    "Only Direction can close works": "Solo Dirección puede cerrar obras",
    "Only Direction can enable post-closure expenses": "Solo Dirección puede habilitar gastos post-cierre",
    "User role not found": "Rol de usuario no encontrado",
    "Invalid user role": "Rol de usuario inválido",
    "Insufficient permissions": "Permisos insuficientes",
    "You can only access your own cashboxes": "Solo puedes acceder a tus propias cajas",
    "Cashbox does not belong to your organization": "La caja no pertenece a tu organización",
    "Only Direction can reject cashbox differences": "Solo Dirección puede rechazar diferencias de caja",
    "Only Direction can make manual adjustments to cashboxes": "Solo Dirección puede hacer ajustes manuales a las cajas",
    "Only Administration and Direction can close months": "Solo Administración y Dirección pueden cerrar meses",
    "Only Direction can reopen closed months": "Solo Dirección puede reabrir meses cerrados",
    "Only Administration and Direction can view reports": "Solo Administración y Dirección pueden ver reportes",
    "Only Administration and Direction can create incomes": "Solo Administración y Dirección pueden crear ingresos",
    "Income does not belong to your organization": "El ingreso no pertenece a tu organización",
    "Only Direction can delete cashboxes": "Solo Dirección puede eliminar cajas",
    "Only Direction can delete accounting records": "Solo Dirección puede eliminar registros contables",
    "Only Direction can delete audit logs": "Solo Dirección puede eliminar registros de auditoría",
    "Only Direction can delete supplier documents": "Solo Dirección puede eliminar documentos de proveedores",
    "Only Direction can delete VAL documents": "Solo Dirección puede eliminar documentos VAL",
    "Only Direction can delete rubrics": "Solo Dirección puede eliminar rubros",
    "Only Direction can delete schedules": "Solo Dirección puede eliminar cronogramas",
    "Only Direction can delete work documents": "Solo Dirección puede eliminar documentos de obra",
    "Only Direction can delete work budgets": "Solo Dirección puede eliminar presupuestos de obra",
    "Only Direction can delete backups": "Solo Dirección puede eliminar respaldos",
    "Only Administration and Direction can delete backups": "Solo Administración y Dirección pueden eliminar respaldos",
    "Only Administration can delete exchange rates": "Solo Administración puede eliminar tasas de cambio",
    "Only Direction can update users": "Solo Dirección puede actualizar usuarios",
    "Only Direction can update roles": "Solo Dirección puede actualizar roles",
    "Only Direction can override blocked contracts": "Solo Dirección puede sobrescribir contratos bloqueados",
    "Only Administration and Direction can approve cashbox differences": "Solo Administración y Dirección pueden aprobar diferencias de caja",
    "Only Administration and Direction can close accounting months": "Solo Administración y Dirección pueden cerrar meses contables",
    "Forbidden": "Acceso prohibido",
  };

  // Buscar traducción exacta
  if (translations[message]) {
    return translations[message];
  }

  // Buscar traducción parcial (para mensajes que contengan estas frases)
  for (const [english, spanish] of Object.entries(translations)) {
    if (message.includes(english)) {
      return spanish;
    }
  }

  // Si no hay traducción, retornar el mensaje original
  return message;
}

/**
 * Traduce mensajes específicos relacionados con cajas del inglés al español
 */
function translateCashboxMessage(message: string): string {
  const translations: Record<string, string> = {
    "User already has an open cashbox. Please close it before creating a new one.": "Ya tienes una caja abierta. Por favor, ciérrala antes de crear una nueva.",
    "Cannot create movement in a closed cashbox. Please open the cashbox first.": "No se puede crear un movimiento en una caja cerrada. Por favor, abre la caja primero.",
    "Cashbox is already closed": "La caja ya está cerrada",
    "Cashbox is already open": "La caja ya está abierta",
  };

  // Buscar traducción exacta
  if (translations[message]) {
    return translations[message];
  }

  // Buscar traducción parcial
  for (const [english, spanish] of Object.entries(translations)) {
    if (message.includes(english)) {
      return spanish;
    }
  }

  return message;
}

