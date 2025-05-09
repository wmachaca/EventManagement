import { PrismaClient, ApplicationStatus } from '@prisma/client';
import { CreateEventInput, UpdateEventInput } from '../models/event';

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
      schedule: new Date(input.schedule), // Convert to Date object
      capacity: input.capacity,
      isVirtual: input.isVirtual,
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
  return prisma.eventApplication.create({
    data: {
      eventId,
      userId,
      status: ApplicationStatus.PENDING,
    },
  });
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
