//src/models/event.ts
import { EventStatus, ApplicationStatus, EventApplication, User, Event } from '@prisma/client';

export interface CreateEventInput {
  name: string;
  description?: string;
  location?: string;
  status?: EventStatus;
  schedule: Date;
  capacity: number;
  isVirtual: boolean;
  creatorId: number;
}

export interface UpdateEventInput {
  name?: string;
  description?: string;
  location?: string;
  schedule?: Date;
  capacity?: number;
  isVirtual?: boolean;
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
