// src/api/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../database/client';
import { UserPayload } from '../../types/userPayload';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    // 2. Decode token
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    console.log('Decoded JWT:', decoded);

    // 3. Attach full user object to the request
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      userId: user.id,
      email: user.email ?? undefined,
      name: user.name ?? undefined,      
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};
