/**
 * Utilidades para el cálculo y gestión del estado de seguros
 */

export interface EstadoSeguro {
  estado: "vigente" | "por-vencer" | "vencido";
  color: "green" | "yellow" | "red";
  texto: string;
  diasRestantes?: number;
}

/**
 * Calcula el estado de un seguro basado en su fecha de vencimiento
 * @param fechaVencimiento - Fecha de vencimiento del seguro (string ISO o Date)
 * @returns Estado del seguro con color y texto descriptivo
 */
export function calcularEstadoSeguro(
  fechaVencimiento: string | Date | null | undefined
): EstadoSeguro {
  if (!fechaVencimiento) {
    return {
      estado: "vencido",
      color: "red",
      texto: "Sin fecha de vencimiento",
    };
  }

  try {
    const fechaVenc = typeof fechaVencimiento === "string" 
      ? new Date(fechaVencimiento) 
      : fechaVencimiento;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaVenc.setHours(0, 0, 0, 0);

    const diffTime = fechaVenc.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        estado: "vencido",
        color: "red",
        texto: "Vencido",
        diasRestantes: Math.abs(diffDays),
      };
    } else if (diffDays <= 15) {
      return {
        estado: "por-vencer",
        color: "yellow",
        texto: `Vence en ${diffDays} día${diffDays !== 1 ? "s" : ""}`,
        diasRestantes: diffDays,
      };
    } else {
      return {
        estado: "vigente",
        color: "green",
        texto: "Vigente",
        diasRestantes: diffDays,
      };
    }
  } catch (error) {
    console.error("Error al calcular estado del seguro:", error);
    return {
      estado: "vencido",
      color: "red",
      texto: "Error en fecha",
    };
  }
}

/**
 * Obtiene el color de badge según el estado del seguro
 */
export function getBadgeColorSeguro(estado: EstadoSeguro["estado"]): "success" | "warning" | "error" {
  switch (estado) {
    case "vigente":
      return "success";
    case "por-vencer":
      return "warning";
    case "vencido":
      return "error";
    default:
      return "error";
  }
}

