// src/types/express.d.ts
import type { UserPayload } from './userPayload';
import type { Event } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      event?: Event;
    }
  }
}
export {};
