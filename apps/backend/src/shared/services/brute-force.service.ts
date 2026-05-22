import { Injectable } from '@nestjs/common';

/**
 * BruteForceService - proteccion contra intentos de login fallidos repetidos.
 *
 * Implementacion in-memory simple (por proceso). Para entornos multi-instancia
 * conviene mover esta logica a Redis o a @nestjs/throttler con storage compartido.
 *
 * Para activarla en endpoints, inyectarla y llamar prevent(ip) antes del login,
 * y reset(ip) cuando el login es exitoso.
 */
interface Attempt {
  count: number;
  firstAt: number;       // timestamp del primer intento del ciclo
  blockedUntil: number;  // timestamp hasta el que esta bloqueado
}

@Injectable()
export class BruteForceService {
  private readonly attempts = new Map<string, Attempt>();
  private readonly maxAttempts = 5;             // intentos permitidos antes de bloquear
  private readonly windowMs = 15 * 60 * 1000;   // ventana de 15 minutos
  private readonly blockMs = 30 * 60 * 1000;    // bloqueo de 30 minutos

  async prevent(ip: string): Promise<void> {
    const now = Date.now();
    const a = this.attempts.get(ip);

    if (a?.blockedUntil && a.blockedUntil > now) {
      const minutes = Math.ceil((a.blockedUntil - now) / 60000);
      const err: any = new Error(
        `Demasiados intentos fallidos. Reintente en ${minutes} minutos.`,
      );
      err.statusCode = 429;
      throw err;
    }

    // Reset si la ventana expiro
    if (!a || now - a.firstAt > this.windowMs) {
      this.attempts.set(ip, { count: 1, firstAt: now, blockedUntil: 0 });
      return;
    }

    a.count += 1;
    if (a.count > this.maxAttempts) {
      a.blockedUntil = now + this.blockMs;
      const err: any = new Error(
        'Demasiados intentos fallidos. Cuenta bloqueada temporalmente.',
      );
      err.statusCode = 429;
      throw err;
    }
  }

  async reset(ip: string): Promise<void> {
    this.attempts.delete(ip);
  }

  /**
   * Estado actual para una IP (uso opcional desde controllers).
   */
  status(ip: string) {
    const now = Date.now();
    const a = this.attempts.get(ip);
    if (!a) {
      return {
        isBlocked: false,
        remainingAttempts: this.maxAttempts,
        maxAttempts: this.maxAttempts,
      };
    }
    const isBlocked = a.blockedUntil > now;
    return {
      isBlocked,
      remainingAttempts: Math.max(0, this.maxAttempts - a.count),
      maxAttempts: this.maxAttempts,
      blockedUntil: isBlocked ? a.blockedUntil : null,
    };
  }
}
