import type { ApplicationStatus } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import type { CreateEventInput, UpdateEventInput } from '../models/event';

const prisma = new PrismaClient();

export const createEvent = async (input: CreateEventInput) => {
  // Validate required creatorId
  if (!input.creatorId) {
    throw new Error('Creator ID is required');
  }

  return prisma.event.create({
    data: {
      name: input.name,
      description: input.description,
      location: input.location,
      startDate: new Date(input.startDate), // 🔁 updated from schedule
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      capacity: input.capacity,
      isVirtual: input.isVirtual,
      imageUrl: input.imageUrl,
      status: input.status || 'DRAFT', // Default to DRAFT if not provided
      creator: {
        connect: { id: input.creatorId }, // Properly connect the creator
      },
    },
    include: {
      creator: true, // Include creator in the response
    },
  });
};

export const updateEvent = async (id: number, input: UpdateEventInput) => {
  return prisma.event.update({
    where: { id },
    data: input,
  });
};

export const getEventById = async (id: number, includeDeleted = false) => {
  return prisma.event.findUnique({
    where: {
      id,
      isDeleted: includeDeleted ? undefined : false,
    },
    include: {
      creator: true,
      applications: {
        include: {
          user: true,
        },
      },
    },
  });
};

export const listEvents = async (filter: {
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELED';
  creatorId?: number;
  includeDeleted?: boolean; // New option
}) => {
  return prisma.event.findMany({
    where: {
      ...filter,
      isDeleted: filter.includeDeleted ? undefined : false, // Exclude deleted unless requested
    },
    include: {
      creator: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const deleteEvent = async (eventId: number, creatorId: number) => {
  // Verify the event exists and belongs to the creator
  const existingEvent = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!existingEvent || existingEvent.creatorId !== creatorId) {
    throw new Error('Event not found or unauthorized');
  }

  // Perform soft delete
  return prisma.event.update({
    where: { id: eventId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      status: 'CANCELED', // Optionally cancel the event when deleting
    },
  });
};

export const restoreEvent = async (eventId: number, creatorId: number) => {
  // Verify the event exists and belongs to the creator
  const existingEvent = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!existingEvent || existingEvent.creatorId !== creatorId) {
    throw new Error('Event not found or unauthorized');
  }

  // Restore the soft-deleted event
  return prisma.event.update({
    where: { id: eventId },
    data: {
      isDeleted: false,
      deletedAt: null,
      status: 'DRAFT', // Or whatever status makes sense for your app
    },
  });
};

export const applyToEvent = async (eventId: number, userId: number) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { attendees: true, applications: true },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  // Check if user is already registered
  const existingRegistration = event.attendees.some(attendee => attendee.id === userId);
  if (existingRegistration) {
    throw new Error('User already registered for this event');
  }

  // Check if event is at capacity
  if (event.attendees.length >= event.capacity) {
    throw new Error('Event is at full capacity');
  }

  // Create both the application and add to attendees
  const [application] = await prisma.$transaction([
    prisma.eventApplication.create({
      data: {
        eventId,
        userId,
        status: 'APPROVED', // Assuming immediate approval for now
      },
    }),
    prisma.event.update({
      where: { id: eventId },
      data: {
        attendees: {
          connect: { id: userId },
        },
      },
    }),
  ]);

  return application;
};

export const cancelRegistration = async (eventId: number, userId: number) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { attendees: true, applications: true },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  // Check if user is registered
  const isRegistered = event.attendees.some(attendee => attendee.id === userId);
  if (!isRegistered) {
    throw new Error('User is not registered for this event');
  }

  // Remove both the application and attendee
  await prisma.$transaction([
    prisma.eventApplication.deleteMany({
      where: {
        eventId,
        userId,
      },
    }),
    prisma.event.update({
      where: { id: eventId },
      data: {
        attendees: {
          disconnect: { id: userId },
        },
      },
    }),
  ]);

  return true;
};

export const checkUserRegistration = async (eventId: number, userId: number) => {
  const [application, attendee] = await Promise.all([
    prisma.eventApplication.findFirst({
      where: {
        eventId,
        userId,
      },
    }),
    prisma.event.findFirst({
      where: {
        id: eventId,
        attendees: {
          some: {
            id: userId,
          },
        },
      },
    }),
  ]);

  return {
    isRegistered: !!application || !!attendee,
    applicationStatus: application?.status || null,
  };
};

export const updateApplicationStatus = async (applicationId: number, status: ApplicationStatus) => {
  return prisma.eventApplication.update({
    where: { id: applicationId },
    data: { status },
  });
};

export const getEventApplications = async (eventId: number) => {
  return prisma.eventApplication.findMany({
    where: { eventId },
    include: {
      user: true,
    },
  });
};

export const getDeletedEventsByUserId = async (userId: number) => {
  return prisma.event.findMany({
    where: {
      creatorId: userId,
      deletedAt: {
        not: null,
      },
    },
    orderBy: {
      deletedAt: 'desc',
    },
  });
};
