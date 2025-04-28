// src/api/middleware/security.ts
import { Request, Response, NextFunction } from 'express';
import { sanitizeUser } from '../../utils/authUtils';

export function filterAuthData() {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send.bind(res);

    res.send = function (data: any) {
      if (data?.user) {
        data.user = sanitizeUser(data.user);
      }
      return originalSend(data);
    };

    next();
  };
}
