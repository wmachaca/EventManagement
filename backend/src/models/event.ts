//src/models/event.ts
import type { EventStatus, ApplicationStatus, EventApplication, User, Event } from '@prisma/client';

export interface CreateEventInput {
  name: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  capacity: number;
  isVirtual: boolean;
  virtualLink?: string;
  imageUrl?: string;
  contactEmail?: string;
  status?: EventStatus;
  creatorId: number;
}

export interface UpdateEventInput {
  name?: string;
  description?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  capacity?: number;
  isVirtual?: boolean;
  virtualLink?: string;
  imageUrl?: string;
  contactEmail?: string;
  status?: EventStatus;
}

export interface EventApplicationInput {
  eventId: number;
  userId: number;
}

export interface UpdateApplicationStatusInput {
  applicationId: number;
  status: ApplicationStatus;
}

export type EventWithApplications = Event & {
  applications: EventApplication[];
};

export type EventWithCreator = Event & {
  creator: User;
};
