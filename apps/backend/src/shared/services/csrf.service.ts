import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as Tokens from 'csrf';

@Injectable()
export class CsrfService {
  private readonly tokens = new Tokens();

  generateToken(response: Response, user: any): string {
    const secret = this.tokens.secretSync();
    const token = this.tokens.create(secret);

    response.cookie('csrf-secret', secret, { httpOnly: true });

    return token;
  }

  verifyToken(secret: string, token: string): boolean {
    return this.tokens.verify(secret, token);
  }

  clearToken(response: Response): void {
    response.clearCookie('csrf-secret');
  }
}
