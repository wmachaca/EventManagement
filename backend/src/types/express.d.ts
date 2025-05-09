// types/express.d.ts
import { UserPayload } from './userPayload';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
