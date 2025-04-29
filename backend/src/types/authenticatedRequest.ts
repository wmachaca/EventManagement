// src/types/AuthenticatedRequest.ts
import { Request } from 'express';
import { UserPayload } from './userPayload';

export interface AuthenticatedRequest extends Request {
  user: UserPayload;
}
export function isAuthenticated(req: Request): req is AuthenticatedRequest {
  return req.user !== undefined;
}