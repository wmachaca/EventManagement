// src/types/UserPayload.ts
export interface UserPayload {
    userId: number;
    email?: string;
    name?: string;
    role?: 'user' | 'admin'; // optional example
    // Add any other fields you attach to req.user
  }
  