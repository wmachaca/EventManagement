// types/application.ts
export interface Application {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  reviewedAt: string | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
  eventId: number;
}
