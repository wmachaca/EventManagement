// src/types/AuthenticatedRequest.ts
import type { Request } from 'express';
import type { UserPayload } from './userPayload';

export interface AuthenticatedUser {
  id: number;
  email?: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user: UserPayload;
  file?: Express.Multer.File;
}
export function isAuthenticated(req: Request): req is AuthenticatedRequest {
  return req.user !== undefined;
}
