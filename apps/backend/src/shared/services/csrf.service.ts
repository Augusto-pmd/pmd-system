import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import Tokens = require('csrf');

@Injectable()
export class CsrfService {
  private readonly tokens = new Tokens();

  generateToken(response: Response, _user: any): string {
    const secret = this.tokens.secretSync();
    const token = this.tokens.create(secret);
    response.cookie('csrf-secret', secret, { httpOnly: true });
    return token;
  }

  verifyToken(secret: string, token: string): boolean {
    return this.tokens.verify(secret, token);
  }

  // Alias para compatibilidad con csrf.guard.ts que llama validateToken
  validateToken(secret: string, token: string): boolean {
    return this.verifyToken(secret, token);
  }

  clearToken(response: Response): void {
    response.clearCookie('csrf-secret');
  }
}
