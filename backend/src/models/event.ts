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
  requiresApproval?: boolean;
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
  requiresApproval?: boolean;
  version: number;
}

export interface EventApplicationInput {
  eventId: number;
  userId: number;
}

export interface UpdateApplicationStatusInput {
  applicationId: number;
  status: ApplicationStatus;
  //reviewedById: number;//owner
}

export type EventWithApplications = Event & {
  applications: EventApplication[];
};

export type EventWithCreator = Event & {
  creator: User;
};

export type EventWithRelations = Event & {
  creator?: User;
  applications?: EventApplication[];
  attendees: User[];
};

export type ApplicationDetails = {
  isRegistered: boolean;
  status: ApplicationStatus | null;
  eventId?: number;
  eventName?: string;
  startDate?: Date;
  capacity?: number;
  currentAttendees?: number;
};

export type ApplicationWithUser = EventApplication & {
  user: Pick<User, 'id' | 'name' | 'email'>;
  event: Pick<Event, 'id' | 'name' | 'startDate'>;
};
