/**
 * Helper function to extract meaningful error messages from API errors
 */
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (!error) {
    return defaultMessage;
  }

  // Handle Axios errors
  if (typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;
    
    // Try to get message from response data
    if (axiosError.response?.data) {
      const data = axiosError.response.data;
      
      // Check for message field (handle nested message objects)
      if (data.message) {
        if (typeof data.message === 'string') {
          return data.message;
        }
        if (typeof data.message === 'object' && data.message.message) {
          return typeof data.message.message === 'string' ? data.message.message : defaultMessage;
        }
      }
      
      // Check for error field
      if (data.error) {
        return typeof data.error === 'string' ? data.error : data.error.message || defaultMessage;
      }
      
      // Check for validation errors (array of messages)
      if (Array.isArray(data.message)) {
        return data.message.join(', ');
      }
      
      // Check for nested error messages
      if (data.errors && Array.isArray(data.errors)) {
        return data.errors.map((e: any) => e.message || e).join(', ');
      }
    }
    
    // Handle HTTP status codes
    if (axiosError.response?.status) {
      const status = axiosError.response.status;
      switch (status) {
        case 400:
          return axiosError.response.data?.message || 'Solicitud inválida. Verifica los datos ingresados.';
        case 401:
          return 'No autorizado. Por favor, inicia sesión nuevamente.';
        case 403:
          return 'No tienes permisos para realizar esta acción.';
        case 404:
          return 'Recurso no encontrado.';
        case 409:
          return axiosError.response.data?.message || 'Conflicto: el recurso ya existe o está en uso.';
        case 422:
          return axiosError.response.data?.message || 'Datos inválidos. Verifica los campos del formulario.';
        case 500:
          return 'Error del servidor. Por favor, intenta nuevamente más tarde.';
        case 503:
          return 'Servicio no disponible. Por favor, intenta nuevamente más tarde.';
        default:
          return axiosError.response.data?.message || `Error ${status}. Por favor, intenta nuevamente.`;
      }
    }
    
    // Handle network errors
    if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
      return 'La solicitud tardó demasiado. Por favor, verifica tu conexión e intenta nuevamente.';
    }
    
    if (axiosError.message === 'Network Error' || !axiosError.response) {
      return 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
}

/**
 * Get a user-friendly error message for specific operations
 */
export function getOperationErrorMessage(operation: string, error: unknown): string {
  const defaultMessages: Record<string, string> = {
    create: 'Error al crear el recurso. Por favor, intenta nuevamente.',
    update: 'Error al actualizar el recurso. Por favor, intenta nuevamente.',
    delete: 'Error al eliminar el recurso. Por favor, intenta nuevamente.',
    validate: 'Error al validar el recurso. Por favor, intenta nuevamente.',
    reject: 'Error al rechazar el recurso. Por favor, intenta nuevamente.',
    load: 'Error al cargar los datos. Por favor, recarga la página.',
    save: 'Error al guardar los cambios. Por favor, intenta nuevamente.',
  };

  const defaultMessage = defaultMessages[operation] || 'Ha ocurrido un error. Por favor, intenta nuevamente.';
  return getErrorMessage(error, defaultMessage);
}

