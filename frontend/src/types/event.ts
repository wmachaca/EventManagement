// Enum-like string literal types (should match your Prisma schema exactly)
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELED';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Basic user type (shared across app — consider moving to src/types/user.ts)
export interface BasicUser {
  id: number;
  name: string;
  email: string;
}

// Core event model (matches DB schema)
export interface Event {
  id: number;
  name: string;
  description?: string;
  location?: string;
  schedule: string; // ISO string format
  capacity: number;
  isVirtual: boolean;
  creatorId: number;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  version: number;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

// Extended event type for frontend display, e.g., when querying full creator info or attendees
export interface EventWithRelations extends Event {
  creator?: BasicUser;
  attendees?: BasicUser[];
  applications?: EventApplication[];
}

// Application for an event by a user
export interface EventApplication {
  id: number;
  eventId: number;
  userId: number;
  user: BasicUser;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

// Form input data when creating/updating an event
export interface EventFormData {
  name: string;
  description?: string;
  location?: string;
  schedule: string; // ISO string
  capacity: number;
  isVirtual: boolean;
  status: EventStatus;
}
