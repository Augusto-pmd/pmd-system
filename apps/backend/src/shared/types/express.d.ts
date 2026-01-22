import { JwtUserPayload } from '../../core/auth/interfaces/jwt-user-payload.interface';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

export {};

